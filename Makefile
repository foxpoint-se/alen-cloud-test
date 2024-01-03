SHELL = /bin/bash

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

ssh-to-server:		## SSH to server using .pem file
	./scripts/ssh-to-server.sh

setup-keypair-pem:		## get key pair for root ssh access
	./scripts/setup-keypair-pem.sh

setup-deploy:
	cd deploy && yarn

setup: setup-deploy		## install and setup everything for development

diff: setup		## cdk diff
	cd deploy && yarn cdk diff

deploy: setup		## deploy everything
	cd deploy && yarn cdk deploy

destroy: setup		## destroy everything
	cd deploy && yarn cdk destroy
