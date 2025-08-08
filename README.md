# Vehicle Diagnostics Log Backend Service

This backend service parses, processes, stores, retrieves and filters vehicle diagnostics log data stored in Cassandra DB. Data can be filtered by a combo of vehicle ID, error code and date ranges. The frontend is available at https://github.com/nobodyn0se/vehicle-log-frontend. The OpenAPI spec for the service is at https://nobodyn0se.github.io/vehicle-log-backend/

## Assumptions
- For the use case, Cassandra DB has been used with the assumption that the operations would be write-heavy at larger scales which would benefit from Cassandra's fast write speeds.
- Retrieval and filtering would not constitute higher proportion of the activity.
- Timestamps are considered to be UTC based unless specified to minimize local time zone ambiguities.
- Vehicle IDs could be string inputs in the future, hence not explicitly parsed into numbers.
- None of the data, including the timestamps, is assumed to be distinct.

## Setup
Clone the repo using `git clone https://github.com/nobodyn0se/vehicle-log-backend.git`

Navigate to the root folder with `cd vehicle-log-backend`

Dockerize the Cassandra DB container using `docker compose up -d`

Verify that cassandra-container is up and running with `docker ps`

Run `npm install`

For pnpm, run `pnpm install`

Run `npm run dev` or `pnpm run dev` to start the local development server.

## Running unit tests

Run `npm run test` to execute the unit tests.

## To reset the DB and start afresh

Run `docker compose down` and delete docker volume data

Run `docker compose up -d`

Re-run the express app

## Todos
- Paginate the responses from the API using Cassandra pageState
- Use ORMs if necessary (avoided excessive overheads in favor of base functionality and fine-grained control)
- Migrate to read-heavy DBs if retrieval becomes a priority
- Implement indexing to optimize the queries
