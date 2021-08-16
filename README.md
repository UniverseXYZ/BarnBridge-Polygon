# UniverseXYZ-Polygon

This repo contains some utilitarian smart contracts to help with interactions between Ethereum and Polygon.

## Polygon Community Vault

This contract has a deployment on the root chain and the child chain. The root chain deployment can be used to move a token through the Polygon Bridge onto the child chain where it behaves like the current Community Vault.

[PolygonCommunityVault Docs](docs/PolygonCommunityVault.md)


## Polygon Token Harvester

To repatriate fees and funds from the child chain to the DAO on the root chain you can use the child deployment of this contract to burn the specified tokens on the Polygon side and the root deployment to recover and transfer them to the DAO.

[PolygonTokenHarvester Docs](docs/PolygonTokenHarvester.md)


## Polygon DAO Root and Child

For full decentralisation this pair of contracts can be used to carry over and execute root DAO proposals on the child chain.

[PolygonDAORoot Docs](docs/PolygonDAORoot.md)
[PolygonDAOChild Docs](docs/PolygonDAOChild.md)
