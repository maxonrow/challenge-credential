
ROOT_PATH := $(shell pwd)
SERVICE_NAME := meds-admin-portal
SERVICE_PATH := $(ROOT_PATH)

.PHONY:
all: release

version-major:
	@npm -s --prefix $(SERVICE_PATH) version major > /dev/null

version-minor:
	@npm -s --prefix $(SERVICE_PATH) version minor

version-patch:
	npm -s --prefix $(SERVICE_PATH) version patch > /dev/null

version-prerelease:
	@npm -s --prefix $(SERVICE_PATH) version prerelease --preid=rc > /dev/null

version:
	@echo $(REGISTRY_URL)$(SERVICE_NAME):$(shell node -p "require('$(SERVICE_PATH)/package.json').version")

build: $(ROOT_PATH)/services.$(SERVICE_NAME).Dockerfile
	@docker build -t $(SERVICE_NAME):$(shell node -p "require('$(ROOT_PATH)/package.json').version") \
		-f $(ROOT_PATH)/services.$(SERVICE_NAME).Dockerfile . && \
	docker tag $(SERVICE_NAME):$(shell node -p "require('$(ROOT_PATH)/package.json').version") $(SERVICE_NAME)

release:
	@docker tag $(SERVICE_NAME):$(shell node -p "require('$(SERVICE_PATH)/package.json').version") \
		$(REGISTRY_URL)$(SERVICE_NAME):$(shell node -p "require('$(SERVICE_PATH)/package.json').version")
	@docker push $(REGISTRY_URL)$(SERVICE_NAME):$(shell node -p "require('$(SERVICE_PATH)/package.json').version")
