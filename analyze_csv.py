#!/usr/bin/env python3
import csv
try:
    import chardet
except ImportError:
    chardet = None

statuses = set()
emails = set()

# Detect encoding
encoding = 'utf-8'
if chardet:
    with open('churnsAccounts2.csv', 'rb') as f:
        raw_data = f.read()
        detected = chardet.detect(raw_data)
        encoding = detected.get('encoding', 'utf-8')
        print(f"🔍 Detected encoding: {encoding}")

status_counts = {}

with open('churnsAccounts2.csv', 'r', encoding=encoding, errors='replace') as f:
    reader = csv.DictReader(f)
    for row in reader:
        status = row['Customer Success Path'].strip('"')
        email = row['Email'].strip('"').lower()
        statuses.add(status)
        emails.add(email)
        status_counts[status] = status_counts.get(status, 0) + 1

print(f'Total unique emails: {len(emails)}')
print(f'Total unique statuses: {len(statuses)}')
print('\nUnique Customer Success Path values:')
for status in sorted(statuses):
    print(f'  - "{status}"')

print('\nStatus counts:')
for status, count in sorted(status_counts.items(), key=lambda x: x[1], reverse=True):
    print(f'  - {status}: {count} records')
