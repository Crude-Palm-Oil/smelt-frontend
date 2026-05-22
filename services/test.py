from app.services.auth import hash_password

password = "password"

hashed = hash_password(password)

print("\nPlain Password:")
print(password)

print("\nHashed Password:")
print(hashed)