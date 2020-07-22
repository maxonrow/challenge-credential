# ![https://maxonrow.com](https://maxonrow.com/images/maxonrow_gold.png)

### Step 1 - Install Docker Compose

- Install Docker Compose [click here](https://docs.docker.com/compose/install/) (skip if you have this preinstalled)

### Step 2 - Clone Challenge-Credential

- Clone project `$ git clone https://github.com/maxonrow/challenge-credential.git`

### Step 3 - Build & Run

- open terminal, go to project root, run `cd backend`
- run `docker build -t credential-api:1.0.1 -f services.credential-api.Dockerfile .`
- run `docker-compose up`
- you should see `Service is serving http://[::]:8081` output generated in your terminal when backend service starts up sucessfully

### Step 4 - Checkout Article

- checkout our [cookbook](https://medium.com/) on how to design & implement NFT.
- please! remember to claps, follow & share. we will mint you something! You will find out soon!

