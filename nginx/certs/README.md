# SSL сертификаты

Поместите сюда файлы `server.crt` и `server.key` (или `fullchain.pem` и `privkey.pem`, скорректировав путь в `nginx.conf`).

Для локального запуска можно сгенерировать самоподписанный сертификат:

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/server.key \
  -out nginx/certs/server.crt \
  -subj "/CN=localhost"
```
