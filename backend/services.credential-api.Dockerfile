FROM node:10.13.0-jessie as builder
WORKDIR /backend/services/credential-api/
ADD ./services/credential-api/package.json /backend/services/credential-api/
ADD ./services/credential-api/package-lock.json /backend/services/credential-api/
ADD ./services/credential-api/tsconfig.json /backend/services/credential-api/
ADD ./services/credential-api/src /backend/services/credential-api/src
RUN npm install --production
RUN npm run build

FROM node:10.13.0-alpine
WORKDIR /backend/services/credential-api/
COPY --from=builder /backend /backend/
