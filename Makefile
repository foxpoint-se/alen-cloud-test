SHELL = /bin/bash

.PHONY: help

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help

.PHONY: ssh-to-server
ssh-to-server:		## SSH to server using .pem file
	./scripts/ssh-to-server.sh

.PHONY: setup-keypair-pem
setup-keypair-pem:		## get key pair for root ssh access
	./scripts/setup-keypair-pem.sh

.PHONY: setup-deploy
setup-deploy:
	cd deploy && yarn

.PHONY: setup
setup: setup-deploy		## install and setup everything for development

.PHONY: diff
diff: setup		## cdk diff
	cd deploy && yarn cdk diff

.PHONY: deploy
deploy: setup		## deploy everything
	cd deploy && yarn cdk deploy

.PHONY: destroy
destroy: setup		## destroy everything
	cd deploy && yarn cdk destroy

.PHONY: add-my-pub-key
add-my-pub-key:		## add ~/.ssh/id_rsa.pub to instance
	./scripts/add-my-pub-key.sh

.PHONY: ssh-me
ssh-me:		## SSH using your own key (assuming you've added it)
	./scripts/ssh-me.sh
