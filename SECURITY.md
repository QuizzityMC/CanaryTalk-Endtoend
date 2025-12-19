# CanaryTalk Security & Privacy

## Overview

CanaryTalk implements **true end-to-end encryption** using industry-standard cryptography. This document explains how your messages are protected.

## Encryption Implementation

### Cryptography Library

**libsodium (NaCl - "Networking and Cryptography library")**
- Trusted, audited cryptography library
- Used by: Signal, WireGuard, and many security-critical applications
- Implements modern, secure cryptographic primitives

### Key Generation

Each user generates a **unique key pair** upon first use:
- **Public Key**: Shared with the server and other users for encryption
- **Private Key**: Stored **only on your device**, never transmitted

**Storage:**
- Web: Browser's `localStorage`
- Desktop: Electron's secure storage
- Mobile: Platform-specific secure storage (Keychain on iOS, Keystore on Android)

### Encryption Algorithm

**Algorithm**: X25519-XSalsa20-Poly1305 (crypto_box)
- **Key Exchange**: X25519 (Elliptic Curve Diffie-Hellman)
- **Encryption**: XSalsa20 stream cipher
- **Authentication**: Poly1305 MAC

### Message Flow

1. **Sending a Message**
   ```
   You type: "Hello, World!"
   ↓
   Client generates random nonce
   ↓
   Client encrypts with recipient's public key + your private key
   ↓
   Encrypted message sent to server
   ↓
   Server relays encrypted message (cannot read it)
   ↓
   Recipient decrypts with your public key + their private key
   ↓
   Recipient sees: "Hello, World!"
   ```

2. **What the Server Sees**
   ```
   {
     "fromUserId": "abc123",
     "toUserId": "def456",
     "encryptedContent": "base64-encoded-ciphertext",
     "timestamp": 1234567890
   }
   ```
   The server **cannot decrypt** the message content.

## Security Features

### ✅ What IS Protected

- **Message Content**: Fully encrypted, unreadable by server
- **Private Keys**: Never leave your device
- **Authentication**: JWT tokens with expiration
- **Passwords**: Hashed with bcrypt (10 rounds)
- **Transport Security**: Use HTTPS/WSS in production

### ⚠️ What is NOT Protected (Metadata)

The following **metadata** is visible to the server:
- Who is sending messages to whom (user IDs)
- When messages are sent (timestamps)
- Message count and frequency
- Online/offline status

This is inherent to the client-server architecture and necessary for message delivery.

## Threat Model

### Protected Against

✅ **Server Compromise**: Server cannot read message contents
✅ **Man-in-the-Middle** (with HTTPS): Transport encryption prevents interception
✅ **Database Breach**: Messages are stored encrypted
✅ **Passive Eavesdropping**: All communications encrypted

### NOT Protected Against

❌ **Device Compromise**: If your device is compromised, keys can be stolen
❌ **Malicious Client**: A modified client can steal keys
❌ **Server Metadata Analysis**: Server knows communication patterns
❌ **Recipient Screenshots**: Recipients can save/screenshot messages

## Best Practices

### For Users

1. **Use Strong Passwords**
   - Minimum 12 characters
   - Mix of letters, numbers, symbols
   - Unique per service

2. **Secure Your Device**
   - Keep OS updated
   - Use device lock (PIN/password/biometric)
   - Install from official sources only

3. **Use HTTPS**
   - Always access via `https://` (not `http://`)
   - Verify SSL certificate

4. **Be Aware of Metadata**
   - Server knows who you talk to and when
   - For maximum privacy, consider using Tor/VPN

### For Developers/Admins

1. **Use HTTPS/WSS in Production**
   ```nginx
   # Force HTTPS
   return 301 https://$host$request_uri;
   ```

2. **Secure the Server**
   - Keep dependencies updated
   - Use firewall (UFW, iptables)
   - Regular security audits
   - Enable fail2ban for brute-force protection

3. **Secure JWT Secret**
   ```bash
   # Generate strong secret
   openssl rand -base64 64
   ```
   Store in `.env`, never commit to git.

4. **Regular Backups**
   - Backup database regularly
   - Secure backup storage
   - Test restore procedures

5. **Monitor Logs**
   ```bash
   pm2 logs canarytalk
   ```
   Watch for suspicious activity.

## Security Audit Checklist

- [ ] JWT_SECRET changed from default
- [ ] HTTPS/WSS enabled in production
- [ ] Firewall configured
- [ ] Dependencies updated
- [ ] Server logs monitored
- [ ] Database backed up
- [ ] SSL certificate valid
- [ ] Strong password policy enforced

## Limitations

### Known Limitations

1. **No Perfect Forward Secrecy**
   - Current implementation doesn't rotate keys
   - Future: Implement Signal Protocol ratcheting

2. **No Group Chat Encryption**
   - Group chats not yet implemented
   - Future: Multi-party encryption

3. **No Message Deletion**
   - Messages remain on server
   - Future: Add message deletion API

4. **Metadata Exposure**
   - Server sees communication patterns
   - Consider: Onion routing for metadata protection

## Future Improvements

### Planned Security Enhancements

- [ ] Perfect Forward Secrecy (PFS)
- [ ] Signal Protocol double ratchet
- [ ] Key rotation
- [ ] Self-destructing messages
- [ ] Screenshot detection (mobile)
- [ ] Two-factor authentication (2FA)
- [ ] End-to-end encrypted group chats
- [ ] Metadata obfuscation

## Vulnerability Disclosure

Found a security issue? Please report responsibly:

1. **DO NOT** open a public GitHub issue
2. Email: security@yourdomain.com (or create a secure contact)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (optional)

We aim to respond within 48 hours.

## Compliance

### GDPR Considerations

- **Data Minimization**: Only essential data stored
- **Right to Erasure**: Implement account deletion
- **Data Portability**: Allow message export
- **Encryption**: End-to-end encrypted by default

### HIPAA/FERPA

⚠️ CanaryTalk is **NOT** currently certified for:
- Healthcare (HIPAA)
- Educational records (FERPA)
- Financial services (PCI-DSS)

Additional compliance measures required for regulated industries.

## Cryptographic Details

### Key Sizes
- **Public Key**: 32 bytes (X25519)
- **Private Key**: 32 bytes (X25519)
- **Nonce**: 24 bytes (random)
- **MAC**: 16 bytes (Poly1305)

### RNG (Random Number Generator)
- Uses platform's cryptographically secure RNG
- Web: `crypto.getRandomValues()`
- Node.js: `crypto.randomBytes()`

## References

- [libsodium Documentation](https://libsodium.gitbook.io/)
- [NaCl: Networking and Cryptography library](https://nacl.cr.yp.to/)
- [Signal Protocol](https://signal.org/docs/)
- [OWASP Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

## Disclaimer

This software is provided "as is" without warranty. While we implement industry-standard encryption, we make no guarantees about absolute security. Use at your own risk.

For maximum security in high-risk scenarios, consider using dedicated secure messaging apps like Signal or Wire, which have undergone extensive security audits.

---

**Remember**: Security is a shared responsibility. Stay vigilant! 🔒
