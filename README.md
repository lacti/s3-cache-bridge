# S3 cache bridge

To reduce access time and costs, use a local file as cache while transferring data with S3.

## Quick start

```bash
# Set environment, first.
export ...;

# Run
docker-compose pull &&
  docker-compose up -d
```

### API

| Method | Description              | Example                            |
| ------ | ------------------------ | ---------------------------------- |
| GET    | Get an object            | `curl -XGET localhost:3000/abc`    |
| PUT    | Put an object            | `curl -T abc localhost:3000/abc`   |
| DELETE | Delete an object         | `curl -XDELETE localhost:3000/abc` |
| POST   | Update a state of object | `curl -XPOST localhost:3000/abc`   |

#### GET Options

| Option   | Description                    | Example                                  |
| -------- | ------------------------------ | ---------------------------------------- |
| `noLock` | Get an object without the lock | `curl -XGET localhost:3000/abc?noLock=1` |

#### PUT Options

| Option   | Description                    | Example                                   |
| -------- | ------------------------------ | ----------------------------------------- |
| `append` | Append content to an object    | `curl -T abc localhost:3000/abc?append=1` |
| `sync`   | Sync with S3 immediately       | `curl -T abc localhost:3000/abc?sync=1`   |
| `noLock` | Put an object without the lock | `curl -T abc localhost:3000/abc?noLock=1` |

#### DELETE Options

| Option   | Description                       | Example                                     |
| -------- | --------------------------------- | ------------------------------------------- |
| `cache`  | Delete cache only                 | `curl -XDELETE localhost:3000/abc?cache=1`  |
| `noLock` | Delete an object without the lock | `curl -XDELETE localhost:3000/abc?noLock=1` |

#### POST Options

| Option         | Description              | Example                                       |
| -------------- | ------------------------ | --------------------------------------------- |
| `sync`         | Sync with S3 immediately | `curl -XPOST localhost:3000/abc?sync=1`       |
| `lock=acquire` | Acquire a lock of key    | `curl -XPOST localhost:3000/abc?lock=acquire` |
| `lock=release` | Release a lock of key    | `curl -XPOST localhost:3000/abc?lock=release` |

### Environment

| Name                  | Description                                | Default value          |
| --------------------- | ------------------------------------------ | ---------------------- |
| BUCKET_NAME           | S3 Bucket name to bridge                   | None / Required        |
| CACHE_DIR             | A directory to place cache files           | `/tmp/s3-cache/bridge` |
| PORT                  | A port to bind Web server                  | 3000                   |
| SYNC_MILLIS           | A interval milliseconds of synchronization | 1 hour                 |
| JWT_SECRET_KEY        | Secret key for JWT                         | None / Optional        |
| AUTH_ID               | ID for Basic Auth                          | None / Optional        |
| AUTH_PASSWORD         | Password for Basic Auth                    | None / Optional        |
| AWS_DEFAULT_REGION    | AWS region code                            | None / Required        |
| AWS_ACCESS_KEY_ID     | AWS Access Key Id                          | None / Required        |
| AWS_SECRET_ACCESS_KEY | AWS Secret Access Key                      | None / Required        |

## Development

```bash
# Install dependencies
yarn

# Create ".envrc" file from ".envrc.example"
cp .envrc.example .envrc && vi .envrc

# Start dev server
yarn start
```

### Build

```bash
docker-compose build
```

## License

MIT
