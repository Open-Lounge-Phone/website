---
title: Passkeys
description: Why accounts use passkeys instead of passwords, how to make one on any device (your phone, a security key or a password manager), and how not to get locked out.
sidebar:
  order: 3
---

Accounts on Open Lounge Phone servers have **no passwords**. You create your account, and sign in
later, with a **passkey**. This page explains what that is, why it's safer, and what to do if
your device doesn't have a fingerprint or face sign-in.

## What a passkey is

A passkey is a sign-in your device keeps for one website. You unlock it the same way you unlock
the device: your fingerprint, your face, or your screen lock PIN. There's nothing to type.

Behind the scenes it's a pair of keys. The private one stays locked inside your device (often in
its security chip), and the server gets only the public one. When you sign in, the server sends a
fresh challenge, your device signs it after you unlock it, and the server checks the signature.

## Why only passkeys

A password is a secret that both you and the server know, so it can leak from either side.
Passkeys remove that weakness:

- **Nothing to steal from the server.** The server keeps only your public key, which can check a
  sign-in but can't make one. If someone copied the server's whole database, they still couldn't
  sign in as you.
- **Nothing to phish.** A passkey only works on the site it was made for. A look-alike site
  can't ask for it, and you can't be tricked into typing it somewhere.
- **Nothing to guess or reuse.** There is no password to guess, to forget, or to reuse on
  another site that then gets hacked.
- **Your fingerprint or face stays with you.** They only unlock the passkey on your device. They
  never go to the server.

It also means the server needs no email address or phone number from you: no password resets, so
nothing to reset them with.

## Security keys (YubiKey and others)

A security key is a passkey you can hold: a small USB, USB-C or NFC key such as a YubiKey. It's
the strongest choice, and it's welcome everywhere you can use a passkey here:

- **It can't be copied.** The passkey is made inside the key and never leaves it, so nothing on
  your computer (not even malware) can take it.
- **It needs you.** It only signs you in when you touch it, and when you've set a PIN on it,
  only with that PIN.
- **It works on any computer.** Plug it in or tap it on your phone; no fingerprint reader or
  account with Apple, Google or Microsoft needed. Good for shared or older computers.

Use a key that can store passkeys (look for **FIDO2**, such as the YubiKey 5 or Security Key
series). Older keys that only do "U2F" can't, because accounts here have no username to type.
Register two keys, or a key and your phone, and keep one somewhere safe.

## Making a passkey on any device

When you create an account or add a passkey, your browser opens a window that offers the ways
your device supports. If yours has no fingerprint or face sign-in, any of these works:

| Option | How |
|---|---|
| **Your phone** | Choose "use a phone or tablet" (or "another device"). Your computer shows a QR code; scan it with your phone's camera and unlock the phone. The passkey is kept on your phone, and you'll use your phone the same way to sign in on that computer. Both need Bluetooth turned on. |
| **A security key** | A small USB, USB-C or NFC key that holds passkeys, such as a YubiKey, Google Titan Key or a Feitian key (look for "FIDO2"). Insert or tap it and touch it when asked. Good for shared or older computers. |
| **A password manager** | Managers that store passkeys and sync them across your devices: iCloud Keychain (Apple devices), Google Password Manager (Android and Chrome), Microsoft (Windows), 1Password, Bitwarden, Dashlane, Proton Pass, KeePassXC. |
| **Your computer's screen lock** | Windows Hello (PIN, face or fingerprint), Touch ID or your Mac's password, or a Chromebook's PIN. These work even without a fingerprint reader. |

Passkeys need a recent browser (Safari, Chrome, Edge or Firefox) and a server address that starts
with `https`. If the app says "This browser can't use passkeys here", open the page in another
browser or on your phone.

## Don't get locked out

- **Add a second passkey.** In the app, open **Account → Your passkeys → Add a passkey** on
  another device, or with a security key. Passkeys kept in iCloud Keychain, Google Password Manager
  or another password manager also follow you to your other devices.
- **Lost all of them?** Someone who manages your household or team can send you a new **sign-in
  link** from the **People** page. Open it and add a new passkey.
- **On your own, with no second passkey?** Then there's no way back in. That's the trade for
  having no password that could be stolen or reset by someone else, so add a second passkey now.

You can see and remove your passkeys under **Account → Your passkeys**. Remove one when you lose
the device it was on.
