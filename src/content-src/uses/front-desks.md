---
title: "Offices and front desks"
description: "A small phone system for a team: extensions, ring groups like \"Front desk\", business hours, shared voicemail, and a lobby phone that rings whoever is on duty."
sidebar:
  label: Offices and front desks
---

A studio, a workshop, a clinic's back office or a small company needs desk phones that reach
each other and a front desk that someone always answers, not a phone contract.

## What it does

- **Extensions and a directory.** Everyone gets a short number (`201`); search people, desk
  phones, rooms and groups by name.
- **Ring groups.** "Front desk" or "Support" rings everyone at once, one after another, or in
  turns. Nobody answers? The caller leaves a message in the group's **shared voicemail**, marked
  "heard by" whoever plays it first.
- **Business hours.** After hours a group goes to voicemail, or to a night line.
- **A lobby phone.** An idle [Lounge phone](/how-to/lounge-phone/) in reception can have a
  house-line key that rings a whole group, the people on duty, at once (first to answer takes
  it), so visitors
  lift the handset and press one key.
- **Desk phones and hot desks.** A personal desk phone is always its owner; a Lounge phone on a
  hot desk is whoever signed in, until the end of the day if you set sessions that way.
- **A public line.** Publish "Support" or "Orders" at its own address (`orders@your.server`)
  so anyone on any server can call without connecting first: callers wait in line with their
  place shown, can leave a voicemail instead, and you can block people or whole servers. Off
  until an admin turns it on. See [Public lines](/how-to/public-lines/).
- **Call log, audit trail and transfer**, across servers inside your space. Recording is
  available, off by default and always announced.

There is no connection to the regular phone network: people reach you by extension, by your
address (`you@your.server`) or as a connection.

## A doorbell at the door (labs)

The [labs firmware](/extend/labs/) has a doorbell mode: any key on the door phone rings the
phones inside with the door's name, and whoever lifts talks to the visitor. It runs on your own
Wi-Fi with no server. Tested on a computer, not yet on a real board.

## Start

1. [Get started](/getting-started/), then create a **Team** or **Organization** space.
2. Follow [A phone system for your team](/how-to/workplace-phone-system/).
3. Publish a ring group as a [public line](/how-to/public-lines/) if customers should reach it.
4. Put a [Lounge phone](/how-to/lounge-phone/) at reception, and read about
   [call recording](/how-to/call-recording/) if you need it.

For a business, run your own server: [on Cloudflare](/how-to/deploy-cloudflare/) or
[with Docker](/how-to/self-host/).
