---
title: Build the hardware
description: The open-hardware phone — design, schematic, PCB layout and assembly.
sidebar:
  order: 5
---

The phone is a compact 3D-printed base with an off-the-shelf analog G-style handset that plugs
into a 3.5 mm jack (for example the Opis 60s Micro). All electronics sit on **one circuit board**
in the base: an ESP32-S3, an audio codec for the handset, a speaker for the ringer, twelve
hot-swap mechanical keys with per-key lights, a small e-ink status strip, NFC and an optional
battery. The handset's microphone gets power only when the mute switch is off *and* the handset
is lifted — in hardware, with two lights wired to that power. It's powered (and flashed) over
USB-C. Hardware is licensed under CERN-OHL-S-2.0.

:::caution[Status]
The hardware is a **pre-production design**: the schematic is captured as code, checked,
simulated and reviewed (revision H5, 2026-09-30); the board layout is being redone for it, and no
boards have been built yet. There is one
board with one parts list (no variants). Expect changes.
:::

Read in this order:

1. [Hardware overview](/hardware/overview/) — what's in the `hardware/` folder.
2. [Hardware design](/hardware/design/) — parts, board, pin map, power budget, cost.
3. [Design guidelines](/hardware/guidelines/) — safety and layout rules every board follows.
4. [Schematic](/hardware/schematic/) — how the schematic-as-code is built and checked.
5. [PCB layout](/hardware/layout/) and [Assembly](/hardware/assembly/) — making and building the
   board (JLCPCB first; outputs work at any PCB house or for hand assembly).

Until then, the [browser emulator](/getting-started/) behaves exactly like the phone, and the
firmware notes are in the [firmware reference](/reference/firmware/).
