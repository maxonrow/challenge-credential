
ROOT_PATH := $(shell pwd)
REGISTRY_URL := registry-intl.cn-hongkong.aliyuncs.com/d_mxw/

.PHONY:
all: mock-api mock-scanner
push: mock-api-push mock-scanner-push
push-only: mock-api-push-only mock-scanner-push-only
release: mock-api-release mock-scanner-release
version: mock-api-version mock-scanner-version

# ==============
# ** MOCK API **
# ==============

mock-api-build: services.mock-api.Makefile
	@make --no-print-directory -fservices.mock-api.Makefile build

mock-api-push:
	@make --no-print-directory -fservices.mock-api.Makefile version-prerelease
	@make --no-print-directory -fservices.mock-api.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-api.Makefile release

mock-api-push-only:
	@make --no-print-directory -fservices.mock-api.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-api.Makefile release

mock-api-release:
	@make --no-print-directory -fservices.mock-api.Makefile version-patch
	@make --no-print-directory -fservices.mock-api.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-api.Makefile release

mock-api: mock-api-build

mock-api-version:
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fservices.mock-api.Makefile version

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

# ==============
# ** MOCK JOB **
# ==============

mock-job-build: jobs.mock-job.Makefile
	@make --no-print-directory -fjobs.mock-job.Makefile build

mock-job-push:
	@make --no-print-directory -fjobs.mock-job.Makefile version-prerelease
	@make --no-print-directory -fjobs.mock-job.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fjobs.mock-job.Makefile release

mock-job-push-only:
	@make --no-print-directory -fjobs.mock-job.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fjobs.mock-job.Makefile release

mock-job-release:
	@make --no-print-directory -fjobs.mock-job.Makefile version-patch
	@make --no-print-directory -fjobs.mock-job.Makefile build
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fjobs.mock-job.Makefile release

mock-job: mock-job-build

mock-job-version:
	@REGISTRY_URL=$(REGISTRY_URL) make --no-print-directory -fjobs.mock-job.Makefile version

# ==============================
# ** LOCAL DEPLOYMENT FOR ALL **
# ==============================

up: mock-api-build mock-scanner-build
	@docker-compose up

down:
	@docker-compose down
