#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE SCHEMA marketplace;
    CREATE SCHEMA squid_marketplace;
    CREATE SCHEMA squid_trades;
    
    -- CREATE THE ROLE AND ASSIGN IT TO THE PREVIOUSLY CREATED DB
    CREATE ROLE testuser WITH LOGIN PASSWORD 'testpassword';
    GRANT ALL PRIVILEGES ON SCHEMA marketplace TO testuser;
    GRANT ALL PRIVILEGES ON SCHEMA squid_marketplace TO testuser;
    GRANT ALL PRIVILEGES ON SCHEMA squid_trades TO testuser;

    -- CREATE THE TRADES SQUID TABLES
    CREATE TABLE squid_trades."trade" ("id" character varying NOT NULL, "uses" integer NOT NULL, "signature" text NOT NULL, "network" character varying(8) NOT NULL, "status" character varying(9) NOT NULL, CONSTRAINT "PK_d4097908741dc408f8274ebdc53" PRIMARY KEY ("id"));
    CREATE TABLE squid_trades."signature_index" ("id" character varying NOT NULL, "address" text NOT NULL, "network" character varying(8) NOT NULL, "index" integer NOT NULL, CONSTRAINT "PK_ffa4422e3338f8a5632922e6d4e" PRIMARY KEY ("id"));
    CREATE TABLE squid_trades."contract_status" ("id" character varying NOT NULL, "address" text NOT NULL, "network" character varying(8) NOT NULL, "paused" boolean NOT NULL, CONSTRAINT "PK_14a66107c6d68e6c40c80de1f86" PRIMARY KEY ("id"));
	
    -- CREATE THE MARKETPLACE SQUID TABLES
    CREATE TABLE squid_marketplace."nft" ("network" character varying(8) NOT NULL, "id" character varying NOT NULL, "token_id" numeric NOT NULL, "contract_address" text NOT NULL, "category" character varying(8) NOT NULL, "token_uri" text, "name" text, "image" text, "created_at" numeric NOT NULL, "updated_at" numeric NOT NULL, "sold_at" numeric, "transferred_at" numeric NOT NULL, "sales" integer NOT NULL, "volume" numeric NOT NULL, "search_order_status" character varying(9), "search_order_price" numeric, "search_order_expires_at" numeric, "search_order_created_at" numeric, "search_is_land" boolean, "search_text" text, "search_parcel_is_in_bounds" boolean, "search_parcel_x" numeric, "search_parcel_y" numeric, "search_parcel_estate_id" text, "search_distance_to_plaza" integer, "search_adjacent_to_road" boolean, "search_estate_size" integer, "search_is_wearable_head" boolean, "search_is_wearable_accessory" boolean, "search_wearable_rarity" text, "search_wearable_category" character varying(11), "search_wearable_body_shapes" character varying(10) array, "owner_id" character varying, "active_order_id" character varying, "parcel_id" character varying, "estate_id" character varying, "wearable_id" character varying, "ens_id" character varying, CONSTRAINT "REL_31459100f31150048a6d5fda2a" UNIQUE ("parcel_id"), CONSTRAINT "REL_c93c3ba3d64f3ac7dca84ef45b" UNIQUE ("estate_id"), CONSTRAINT "REL_2d559d06edaadb3c3facd8159c" UNIQUE ("wearable_id"), CONSTRAINT "REL_070ce4690a766ec56a00acc7e0" UNIQUE ("ens_id"), CONSTRAINT "PK_8f46897c58e23b0e7bf6c8e56b0" PRIMARY KEY ("id"));
    CREATE TABLE squid_marketplace."bid" ("network" character varying(8) NOT NULL, "id" character varying NOT NULL, "bid_address" text NOT NULL, "category" character varying(8) NOT NULL, "nft_address" text NOT NULL, "token_id" numeric NOT NULL, "bidder" bytea, "seller" bytea, "price" numeric NOT NULL, "fingerprint" bytea, "status" character varying(9) NOT NULL, "blockchain_id" text NOT NULL, "block_number" numeric NOT NULL, "expires_at" numeric NOT NULL, "created_at" numeric NOT NULL, "updated_at" numeric NOT NULL, "nft_id" character varying, CONSTRAINT "PK_ed405dda320051aca2dcb1a50bb" PRIMARY KEY ("id"));
    CREATE TABLE squid_marketplace."item" ("network" character varying(8) NOT NULL, "id" character varying NOT NULL, "blockchain_id" numeric NOT NULL, "creator" text NOT NULL, "item_type" character varying(17) NOT NULL, "total_supply" numeric NOT NULL, "max_supply" numeric NOT NULL, "rarity" text NOT NULL, "creation_fee" numeric NOT NULL, "available" numeric NOT NULL, "price" numeric NOT NULL, "beneficiary" text NOT NULL, "content_hash" text, "uri" text NOT NULL, "image" text, "minters" text array NOT NULL, "managers" text array NOT NULL, "raw_metadata" text NOT NULL, "urn" text NOT NULL, "created_at" numeric NOT NULL, "updated_at" numeric NOT NULL, "reviewed_at" numeric NOT NULL, "sold_at" numeric, "first_listed_at" numeric, "sales" integer NOT NULL, "volume" numeric NOT NULL, "search_text" text, "search_item_type" text, "search_is_collection_approved" boolean, "search_is_store_minter" boolean NOT NULL, "search_is_wearable_head" boolean, "search_is_wearable_accessory" boolean, "search_wearable_category" character varying(11), "search_wearable_rarity" text, "search_wearable_body_shapes" character varying(10) array, "search_emote_category" character varying(13), "search_emote_loop" boolean, "search_emote_rarity" text, "search_emote_body_shapes" character varying(10) array, "search_emote_has_sound" boolean, "search_emote_has_geometry" boolean, "unique_collectors" text array NOT NULL, "unique_collectors_total" integer NOT NULL, "collection_id" character varying, "metadata_id" character varying, CONSTRAINT "PK_d3c0c71f23e7adcf952a1d13423" PRIMARY KEY ("id"));
    
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOSQL
