# Node.js Rate Limiting Server

## Project Overview

This project implements a Node.js server designed to manage incoming HTTP requests efficiently by enforcing rate limiting based on the Token Bucket algorithm. The server utilizes Redis to store and manage state, ensuring high performance and scalability across multiple server instances. This server is particularly useful for APIs or web services that require controlled access to prevent abuse and ensure fair use of resources among users.
Additionally, this also has a rate limit implementation using rate-limiter-flexible (npm package)

## Features

Rate Limiting: Implements the Token Bucket algorithm to limit the number of requests a client can make within a specified duration. This helps in preventing abuse and overload of the server.

Redis Integration: Uses Redis to maintain the state of request counts and timestamps across sessions and server instances, allowing for consistent rate limiting even in distributed environments.

Configurable Limits: Offers the ability to configure rate limits dynamically, which administrators can adjust based on the current load and requirements without modifying the server code directly.

Robust Handling of Requests: Ensures that all incoming requests are checked against the set rules and only proceed if they comply with the rate limits.
The Incoming request are forwared to any of the implemented servers (server0, server1, server2) using consistent hashing based on the users IP

Sentry for Performace Monitoring: The Project uses sentry for performace monitoring and raising issues, additionally the project uses winston library
for logging errors and console outputs

## Usage

Install docker using the official docker website.

Run the following command\
docker run --name my-redis -p 6379:6379 -d redis\
This will pull the official redis docker image and run it on port 6379

cd into the main project and run\
npm install

now to run the main code using 4 different terminal window

node index.js\
node servers/server0.js\
node servers/serve1.js\
node servers/server2.js

Your project is all setup!!
