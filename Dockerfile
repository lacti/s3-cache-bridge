FROM node:12-alpine AS builder

# Install dependencies.
WORKDIR /tmp
COPY package.json yarn.lock /tmp/
RUN yarn

# Build a bundle.
COPY tsconfig.json webpack.config.js /tmp/
COPY src /tmp/src
RUN yarn build

FROM node:12-alpine

# Add Tini.
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Copy a bundle from the builder.
WORKDIR /opt
COPY --from=builder /tmp/dist/main.* /opt/

# Run
ENV BUCKET_NAME    ""
ENV CACHE_DIR      ""
ENV PORT           ""
ENV SYNC_MILLIS    ""
ENV JWT_SECRET_KEY ""
ENV AUTH_ID        ""
ENV AUTH_PASSWORD  ""

ENV AWS_DEFAULT_REGION    ""
ENV AWS_ACCESS_KEY_ID     ""
ENV AWS_SECRET_ACCESS_KEY ""

CMD ["/usr/local/bin/node", "main.js"]
