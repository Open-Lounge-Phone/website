---
title: Add-ons
description: Link a service to your account, like an AI companion or a notes taker. It gets its own address on your account, only you and the people you choose can talk to it, and you can build one with the Python add-on bridge.
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
3. Type the code, choose its **name** (the part after `+` in its address: 2 to 30 letters,
   digits, dots, dashes or underscores) and tick who besides you may talk to it.
4. Press **Link**. The app shows its address, with **Copy**.

The list shows each add-on's address, whether it's **online** right now (as the server sees it),
who may talk to it, and **Call**, **Who may talk to it** and **Remove**. Removing one cuts it off
at once: its address stops working and it's told to forget the link. To use it again, link it
again.

If the server doesn't offer add-ons, the app says so. Someone who runs their own server turns
them on with `ADDONS=on` ([self-hosting](/how-to/self-host/)) or `--addons`
([Cloudflare](/how-to/deploy-cloudflare/)).

## Who may talk to it

- **You**, always.
- **Connections you tick**, and only them: they can call it, and it can call them, whether
  they're on your server or another one. Untick someone and that stops at once.
- **Nobody else.** Nobody can knock on an add-on, it isn't in any directory, and **kids' phones
  can never reach one**. A call from anyone else ends as if the address didn't exist.

Every call tells the add-on who is calling: their address and name, checked by their server. So
it can greet people by name and keep their conversations apart.

Linking, changing who may talk to it and removing it show up in the space's list of changes
(**Settings → Changes**). An add-on's call minutes count toward its owner's fair-use allowance on
servers that have one.

## Calling it, and being called

- **From the app:** the add-on's **Call** button (Settings → Add-ons).
- **From your desk phone:** on your phone's page in the app, under **Public lines and add-ons**,
  add its address with a label (**Add**), then put it on a key. Lift the handset, press the key.
  Your keys at a [Lounge phone](/how-to/lounge-phone/) come from your desk phone, so it's there
  too.
- **Someone you allowed** calls it from their app: **Connections → Call an add-on**, its address,
  **Call**.
- **It calls you** (or someone you allowed), for a check-in, say. It rings wherever you can be
  rung.

Apps show an add-on with an **add-on** badge. Phones show its name with a label, `SEAT · ADD-ON`
(`SEAT - ADD-ON` on the hardware phone), or the name and `ADD-ON CALLING` when that doesn't fit.

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
`await addon.call("you@hub.example")` places a call. The bridge's
[README](https://github.com/Open-Lounge-Phone/open-lounge-phone/tree/main/sdk/python) has the
whole API and an echo demo; [Add-ons (reference)](/reference/add-ons/) has the messages
underneath, for other languages.
