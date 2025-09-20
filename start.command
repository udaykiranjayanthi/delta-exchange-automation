#!/bin/bash
cd server && yarn install && yarn dev &
cd ui && yarn install && yarn dev &
wait
