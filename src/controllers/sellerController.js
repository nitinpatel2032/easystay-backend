const sellerController = (req, res) => {
    console.log("this is seller controller");
    res.send("Seller controller works!");
};

module.exports = { sellerController };
