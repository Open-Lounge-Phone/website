---
title: Add-ons
description: Link a service to your account, like an AI companion or a notes taker. It gets its own address on your account that only you can call, you can share the parts it offers (a shared project, say) with chosen people, and you can build one with the Python add-on bridge.
sidebar:
  order: 1
---

A phone call is a handset with a microphone and a speaker. An **add-on** puts a service on the
line: an AI you think out loud with, a notes taker, a radio, a doorbell. You link it to your own
account and it gets an address there, like `jesse+seat@hub.example`. Then you can call it from
your app or your desk phone, and it can call you.

Add-ons are optional. A server offers them only if its operator turns them on, and nobody gets
one unless they link it themselves.

## Link one

1. Start linking in the add-on (in Thinking Room's Seat, say, **Connect a phone**). It shows a
   6-digit code.
2. In the companion app, open **Settings**, scroll to **Add-ons** and press **Link an add-on**.
3. Type the code and choose its **name** (the part after `+` in its address: 2 to 30 letters,
   digits, dots, dashes or underscores).
4. Press **Link**. The app shows its address, with **Copy**.

The list shows each add-on's address, whether it's **online** right now (as the server sees it),
its **shares** and who has each, and **Call**, **New shared project with…** and **Remove**.
Removing one cuts it off at once: its address and its shares' addresses stop working and it's
told to forget the link. To use it again, link it again.

If the server doesn't offer add-ons, the app says so. Someone who runs their own server turns
them on with `ADDONS=on` ([self-hosting](/how-to/self-host/)) or `--addons`
([Cloudflare](/how-to/deploy-cloudflare/)).

## Who can reach it

- **You**, always, at its own address (`jesse+seat@hub.example`). That address is yours alone.
- **People you give a share to**, and only to that share (below).
- **Nobody else.** Nobody can knock on an add-on, it isn't in any directory, and **kids' phones
  can never reach one**. A call from anyone else ends as if the address didn't exist.

Every call tells the add-on who is calling: their address and name, checked by their server, and
which share they came through. So it can greet people by name and keep their conversations apart.

## Share part of it

An add-on can't be shared as a whole. Instead, it can offer **parts of itself** for sharing,
such as one shared project in a thinking room. The add-on decides what those parts are; you
decide who gets each one, and the server enforces it.

- Each part, a **share**, shows on the add-on's card with **its own address**, like
  `jesse+seat+bookclub@hub.example`, and **Copy**.
- **Give to…** picks someone: one of your connections (on your server or another one) or someone
  in your spaces. They can call that address, and the add-on can call them within that share.
  Nothing else of the add-on is open to them.
- **Revoke** takes it back at once: a call of theirs into it ends right away.
- **New shared project with…**: type a name, tick people, **Ask**. The add-on makes the new part
  and the people you ticked get it. The app tells you how it went: done, the add-on said no (and
  why), it's offline, or it didn't answer.
- If the add-on stops offering a share, everyone loses it, and their calls into it end.

People you give a share to see it under **Connections**, as "Jesse's seat · Book club" with
**Call** (on that connection, if you're on different servers). Nobody else sees your add-on or
its shares.

If you linked an add-on before shares existed and let some connections talk to it, those entries
were removed: give them a share instead. The card says so once.

Linking, giving and taking back shares, share requests and how they went, and removing an add-on
show up in the space's list of changes (**Settings → Changes**). An add-on's call minutes count
toward its owner's fair-use allowance on servers that have one.

## Calling it, and being called

- **From the app:** the add-on's **Call** button (Settings → Add-ons, or Connections).
- **From your desk phone:** on your phone's page in the app, under **Public lines and add-ons**,
  add its address with a label (**Add**), then put it on a key. Lift the handset, press the key.
  Your keys at a [Lounge phone](/how-to/lounge-phone/) come from your desk phone, so it's there
  too.
- **Someone you gave a share to** calls it from their app (**Connections**, the share's
  **Call**), or puts the share's address on a key of their own desk phone the same way.
- **It calls you**, for a check-in, say, or someone who has one of its shares, within that
  share. It rings wherever they can be rung.

Apps show an add-on with an **add-on** badge. Phones show its name with a label, `SEAT · ADD-ON`
(`SEAT - ADD-ON` on the hardware phone), or the name and `ADD-ON CALLING` when that doesn't fit.
Within a share, the share is the label: "seat · Book club" in the app, `SEAT · BOOK CLUB` on the
browser phone.

During a call with an add-on the app has a **Keypad**: the add-on hears the keys ("press 1
for…"). A call with an add-on is between the two of you: no Add caller and no Transfer, and calls
to and from add-ons don't go to voicemail.

## Build your own

The **add-on bridge** is a small Python library (Apache-2.0, so any service can use it). It does
the linking, the key and the signed check on every connection, reconnects, and turns calls into
events and plain audio frames:

```python
import asyncio
from olp_addon import Addon

addon = Addon("https://hub.example", "seat.addon-key")

@addon.on_call
async def talk(call):
    print("call from", call.caller.name, call.caller.address)
    await call.answer()
    async for frame in call.frames():   # 20 ms of 16-bit mono audio, 48 kHz by default
        await call.send(frame)           # here: an echo

asyncio.run(addon.run())   # shows the link code the first time, then takes calls
```

A real add-on is the same loop: audio in, speech to text, your logic, text to speech, audio out.
`await addon.call("you@hub.example")` places a call.

Sharing takes three more pieces: say what can be shared, check which share a call came through,
and answer "New shared project with…":

```python
from olp_addon import ShareRefused

addon.set_shares([{"id": "bookclub", "label": "Book club"}])

@addon.on_call
async def talk(call):
    if call.share:                       # call.share.id, .label, .grant_id
        ...                              # stay inside that share
    ...

@addon.on_share_request
async def make(request):                 # request.label, request.with_
    return await create_project(request.label)   # the new share's id, or raise ShareRefused("…")

await addon.call("ana@hub.example", share="bookclub")
```

Keeping a shared call inside its share is the add-on's job: the server only makes sure nobody
without the share gets in. Enforce it with the add-on's own permissions (a key or token limited to
that one project, say), not only with instructions to a model. The bridge's
[README](https://github.com/Open-Lounge-Phone/open-lounge-phone/tree/main/sdk/python) has the
whole API and an echo demo; [Add-ons (reference)](/reference/add-ons/) has the messages
underneath, for other languages.
