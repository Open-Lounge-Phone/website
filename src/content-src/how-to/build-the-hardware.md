---
title: Build the hardware
description: The open-hardware phone — the minimal board's design, schematic, layout checklist and assembly.
sidebar:
  order: 5
---

The phone is a compact 3D-printed base with an off-the-shelf analog G-style handset that plugs
into a 3.5 mm jack (for example the Opis 60s Micro). All electronics sit on **one small,
deliberately minimal circuit board** (2 layers, 53 parts): an ESP32-S3 module, one USB-C port
for power and flashing, one 3.3 V regulator, twelve hot-swap mechanical keys and a hook switch,
a socket for a ready-made 2.9" e-paper display module, an audio codec for the handset, a piezo
ringer and one status light. There is **no** battery, NFC, speaker, per-key lights or hardware
mute switch.

**The board has no microphone of its own.** The only microphone is the one in the handset:
unplug the handset and there is no microphone connected at all; while the handset is hung up the
software keeps its mic muted (see the
[security model](https://github.com/Open-Lounge-Phone/open-lounge-phone/blob/main/docs/security-model.md)).
The phone is mains/USB-powered like a landline: no battery by design, it is not a mobile device.
Hardware is licensed under CERN-OHL-S-2.0.

:::caution[Status]
The hardware is a **pre-production design**: the minimal board's schematic is captured as code
and checked (M1, 2026-09-30) and its parts are placed (M2: 156 × 88 mm, every SMD part on the
bottom); routing comes next, and no boards have been built yet. Expect changes.
:::

Read in this order:

1. [Hardware overview](/hardware/overview/) — what's in the `hardware/` folder.
2. [Hardware design](/hardware/design/) — parts, board, pin map, power budget, cost.
3. [Design guidelines](/hardware/guidelines/) — safety and layout rules every board follows.
4. [Schematic](/hardware/schematic/) — how the schematic-as-code is built and checked.
5. [Layout checklist](/hardware/layout/) and [Assembly](/hardware/assembly/) — what the 2-layer
   layout must meet, and building the board (JLCPCB first; any PCB house or hand assembly).

Until then, the [browser emulator](/getting-started/) behaves exactly like the phone, and the
firmware notes are in the [firmware reference](/reference/firmware/).
