#!/bin/bash
DIR="${BASH_SOURCE%/*}"
if [[ ! -d "$DIR" ]]; then DIR="$PWD"; fi

serverName=alen-cloud-test
pemFileName=$DIR/../root.pem
userName=ubuntu

getPublicDns() {
    name=$1
    filter=Name=tag:Name,Values=$name
    aws ec2 describe-instances --filters $filter --output text --query 'Reservations[*].Instances[*].PublicDnsName'
}
