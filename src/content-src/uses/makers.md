---
title: "Makers and tinkerers"
description: "An open ESP32-S3 board with hot-swap MX keys, an e-paper screen and a handset jack, open firmware in C, an open protocol, and a labs build full of experiments."
sidebar:
  label: Makers and tinkerers
---

Under the handset it's a small, deliberately simple board you can understand in an afternoon:
an ESP32-S3, twelve hot-swap MX keys and a key for the hook, a ready-made e-paper module on a header,
an audio codec with a 3.5 mm handset jack, a piezo ringer, one LED and USB-C. Everything about
it is published.

## What you can change

- **The look.** Standard MX switches and 1u keycaps, a 3D-printable box in any colour, any
  CTIA handset on the jack.
- **The firmware.** C on ESP-IDF, with a console over USB, a QEMU simulator and host tests.
  Builds from source connect to no server and check for no updates until you choose
  ([firmware reference](/reference/firmware/)).
- **What the keys do.** The [labs firmware](/extend/labs/) gives each key an action: ring
  another room, run a Home Assistant scene, play a story, send a keyboard shortcut. There are
  games too: press MENU ten times for Snake and Memory.
- **The server and apps.** TypeScript, AGPL-licensed, one codebase for Cloudflare and a Node
  server. The [device protocol](/reference/protocol/) and the
  [federation spec](/reference/federation-spec/) are written down, so you can write your own
  phone, app or server and still talk to everyone else.

## Status

The hardware is an early prototype: four phones on hardware v0.1 dev boards are built and
working, running the experimental labs build (0.0.0), lightly tested so far (full testing waits on
the Wi-Fi antennas). Expect a revision. We recommend a virtual phone to start and board v1.0
before building your own; board v0.9 is coming for tinkerers, assembled or as a bare PCB.

## Start

1. [Build the hardware](/how-to/build-the-hardware/), or try everything first in the
   [browser phone](/getting-started/#try-it-on-your-computer).
2. [Make it yours](/extend/make-it-yours/): where to change what.
3. [Contributing](/project/contributing/).
