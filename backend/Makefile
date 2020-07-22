
ROOT_PATH := $(shell pwd)
REGISTRY_URL := registry-intl.cn-hongkong.aliyuncs.com/d_mxw/

.PHONY:
all: credential-api mock-scanner
push: credential-api-push mock-scanner-push
push-only: credential-api-push-only mock-scanner-push-only
release: credential-api-release mock-scanner-release
version: credential-api-version mock-scanner-version

# ====================
# ** CREDENTIAL API **
# ====================

credential-api-build: services.credential-api.Makefile
	@make --no-print-directory -fservices.credential-api.Makefile build

credential-api-push:
	@make --no-print-directory -fservices.credential-api.Makefile version-prerelease
	@make --no-print-directory -fservices.credential-api.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.credential-api.Makefile release

credential-api-push-only:
	@make --no-print-directory -fservices.credential-api.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.credential-api.Makefile release

credential-api-release:
	@make --no-print-directory -fservices.credential-api.Makefile version-patch
	@make --no-print-directory -fservices.credential-api.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.credential-api.Makefile release

credential-api: credential-api-build

credential-api-version:
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.credential-api.Makefile version

# ==================
# ** MOCK SCANNER **
# ==================

mock-scanner-build: services.mock-scanner.Makefile
	@make --no-print-directory -fservices.mock-scanner.Makefile build

mock-scanner-push:
	@make --no-print-directory -fservices.mock-scanner.Makefile version-prerelease
	@make --no-print-directory -fservices.mock-scanner.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-scanner.Makefile release

mock-scanner-push-only:
	@make --no-print-directory -fservices.mock-scanner.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-scanner.Makefile release

mock-scanner-release:
	@make --no-print-directory -fservices.mock-scanner.Makefile version-patch
	@make --no-print-directory -fservices.mock-scanner.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-scanner.Makefile release

mock-scanner: mock-scanner-build

mock-scanner-version:
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-scanner.Makefile version

# ==============================
# ** LOCAL DEPLOYMENT FOR ALL **
# ==============================

up: credential-api-build mock-scanner-build
	@docker-compose up

down:
	@docker-compose down
