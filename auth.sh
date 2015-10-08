#!/bin/bash

export wtfapitoken=`curl -s -X POST 'http://localhost:9000/api/auth/local' --data-binary '{"email":"fel@ayb.fr","password":"fel"}' -H 'Content-Type: application/json;charset=UTF-8' | tr '"' "\n"  | tail -n 2 | head -n 1`

echo -H "\"Authorization: Bearer $wtfapitoken\"" > .curlrc

echo "use:"
echo "curl -K .curlrc"