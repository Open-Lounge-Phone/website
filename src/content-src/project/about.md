---
title: About
description: Why Open Lounge Phone exists, the principles behind it, and where it stands.
sidebar:
  order: 1
---

## Why

**Being social without social media.** You still need a way to reach your family, your group
and your friends. Open Lounge Phone is a phone you're called on when you choose, by the people
you choose: intentional phone time, not a phone that follows you everywhere.

**A first phone without the internet in it.** Kids want to call grandma and their friends; parents
don't want to hand them a smartphone. Open Lounge Phone is a real phone with real keys and a
handset — and nothing else. No browser, no feeds, no strangers: it can only reach the people a
guardian approves, and it goes quiet at bedtime. And unlike closed kids' phones, it's open: a
child can learn how it works and tinker with it as they grow, while the rules stay with their
guardians.

**A phone that belongs to the room, not the person.** In lounges, clubs and phone booths, the same
hardware becomes a shared phone: take it over with your own contacts, see who's around to chat,
and it forgets you when you leave.

**Not just a phone.** The same board can be a house intercom, a doorbell, a dinner bell or an
elder's daily check-in. See [what it can be](/uses/).

**Inspired by the Tin Can phone.** The idea of a simple, kid-safe landline that only calls
approved people comes from the [Tin Can](https://tincan.kids/) phone. Open Lounge Phone is an
independent, open-source take on that idea (open hardware, your own server, federation). It is not
affiliated with or endorsed by Tin Can, and "Tin Can" is their trademark.

## Principles

- **Default deny.** A phone only talks to people explicitly allowed on it, in both directions.
- **No hosted dependency.** You run it — on your own Cloudflare account or on your own hardware
  with Docker — or use the free public hub, which is just one more server. Servers federate as
  equals; there is no central directory, and nobody sees your call audio.
- **No phone network, no text chat.** A closed, spam-free network of people who accepted each
  other.
- **Screen-light by design.** Keys, lights and voice first; a small status strip at most.
- **Repairable.** Hot-swap keys, a drop-in display, a standard 3.5 mm handset plug.
- **Open.** Software under **AGPL-3.0-or-later**, hardware under **CERN-OHL-S-2.0**. If you run a
  modified server for others, you share your changes.

## Status

| Part | State |
|---|---|
| Server (self-hosted or Cloudflare), companion app, browser phone on any device | works today |
| Calls, voicemail with transcripts, quiet hours, passkeys and invites | works today |
| Connections across servers, the free public hub | works today; the hub is live at hub.openloungephone.app |
| Lounge phones, rooms and 3-way calls, team and organization phone systems, call recording | works today in the apps and the browser phone |
| One-command CLI, interop tests between servers and versions | done |
| Phone firmware (ESP32-S3), 0.9.x | end-to-end tests in a simulator; on the dev boards next |
| Labs firmware, 0.0.0 | the experimental build on the v0.1 dev boards for now; lightly tested |
| Circuit board, hardware v0.1 | early prototype: four phones built and working |
| Board v0.3, assembled or bare PCB | coming soon for tinkerers; no price or date |
| Board v1.0 | the one we'll recommend building |

What changed and when: [versions and releases](/project/versions/). See the
[introduction](/intro/) for the full picture and [contributing](/project/contributing/) to get
involved.
