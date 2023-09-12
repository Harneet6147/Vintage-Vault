// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

struct NFTListing {
    uint256 price;
    address seller;
    address owner;
    uint256 tokenID;
}
struct User {
    string cid;
}

contract VintageVault is ERC721URIStorage {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter public _tokenIDs;
    address payable public owner;
    mapping(uint256 => NFTListing) public _listings;
    mapping(address => User) public users;
    event NFTTransfer(
        uint256 tokenID,
        address from,
        address to,
        string tokenURI,
        uint256 price
    );

    constructor() ERC721("VintageMint", "VTV") {
        owner = payable(msg.sender);
    }

    function createNFT(string calldata tokenURI) public {
        _tokenIDs.increment();
        uint256 currentID = _tokenIDs.current();
        _safeMint(msg.sender, currentID);
        _setTokenURI(currentID, tokenURI);
        _listings[currentID] = NFTListing({
            price: 0,
            seller: address(0),
            owner: msg.sender,
            tokenID: currentID
        });
        emit NFTTransfer(currentID, address(0), msg.sender, tokenURI, 0);
    }

    function listNFT(uint256 _tokenID, uint256 _price) public {
        require(_price > 0, "NFTMarket: price must be greater than 0");
        transferFrom(msg.sender, address(this), _tokenID);
        _listings[_tokenID] = NFTListing({
            price: _price,
            seller: msg.sender,
            owner: address(this),
            tokenID: _tokenID
        });
        emit NFTTransfer(_tokenID, msg.sender, address(this), "", _price);
    }

    function buyNFT(uint256 _tokenID) public payable {
        NFTListing memory listing = _listings[_tokenID];
        require(listing.price > 0, "NFTMarket: nft not listed for sale");
        require(
            msg.value == (listing.price) * (10 ** 18),
            "NFTMarket: incorrect price"
        );
        require(msg.sender != listing.seller, "You cannot buy your own NFT!");
        ERC721(address(this)).transferFrom(address(this), msg.sender, _tokenID);
        clearListing(_tokenID, msg.sender);
        payable(listing.seller).transfer(
            ((listing.price) * (10 ** 18)).mul(95).div(100)
        );
        emit NFTTransfer(_tokenID, address(this), msg.sender, "", 0);
    }

    function cancelListing(uint256 _tokenID) public {
        NFTListing memory listing = _listings[_tokenID];
        require(listing.price > 0, "NFTMarket: nft not listed for sale");
        require(
            listing.seller == msg.sender,
            "NFTMarket: you're not the seller"
        );
        ERC721(address(this)).transferFrom(address(this), msg.sender, _tokenID);
        clearListing(_tokenID, msg.sender);
        emit NFTTransfer(_tokenID, address(this), msg.sender, "", 0);
    }

    function withdrawFunds() public {
        uint256 balance = address(this).balance;
        require(balance > 0, "NFTMarket: balance is zero");
        require(msg.sender == owner, "Access Denied");
        payable(msg.sender).transfer(balance);
    }

    function clearListing(uint256 _tokenID, address _owner) public {
        _listings[_tokenID].price = 0;
        _listings[_tokenID].seller = address(0);
        _listings[_tokenID].owner = _owner;
    }

    function createUser(string memory _cid, address _userId) public {
        User memory newUser = User({cid: _cid});
        users[_userId] = newUser;
    }

    function dashBoard(address _userID) external view returns (User memory) {
        return users[_userID];
    }

    function getOwnedRelics(
        address _user
    ) external view returns (NFTListing[] memory) {
        uint256 cur_token_id = _tokenIDs.current();
        uint256 j = 0;
        for (uint256 i = 1; i <= cur_token_id; i++) {
            if (_listings[i].owner == _user) {
                j++;
            }
        }
        NFTListing[] memory ans = new NFTListing[](j);
        uint256 k = 0;
        for (uint256 i = 1; i <= cur_token_id; i++) {
            if (_listings[i].owner == _user) {
                ans[k] = _listings[i];
                k++;
            }
        }
        return ans;
    }

    function getListedRelics(
        address _user
    ) external view returns (NFTListing[] memory) {
        uint256 cur_token_id = _tokenIDs.current();
        uint256 j = 0;
        for (uint256 i = 1; i <= cur_token_id; i++) {
            if (_listings[i].seller == _user && _listings[i].price > 0) {
                j++;
            }
        }
        NFTListing[] memory ans = new NFTListing[](j);
        uint256 k = 0;
        for (uint256 i = 1; i <= cur_token_id; i++) {
            if (_listings[i].seller == _user && _listings[i].price > 0) {
                ans[k] = _listings[i];
                k++;
            }
        }
        return ans;
    }

    function getVaultRelics() external view returns (NFTListing[] memory) {
        uint256 j = 0;
        uint256 current_id = _tokenIDs.current();
        for (uint256 i = 1; i <= current_id; i++) {
            if (_listings[i].owner == address(this)) {
                j++;
            }
        }

        NFTListing[] memory ans = new NFTListing[](j);
        uint256 k = 0;
        for (uint256 i = 1; i <= current_id; i++) {
            if (_listings[i].owner == address(this)) {
                ans[k] = _listings[i];
                k++;
            }
        }
        return ans;
    }

    function getRelicData(uint256 _id) external view returns (string memory) {
        return tokenURI(_id);
    }
}
