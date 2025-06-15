const express = require("express");
const router = express.Router();
const paypal = require("@paypal/checkout-server-sdk");

// Configurar entorno sandbox
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

// Crear orden de pago
router.post("/create-paypal-order", async (req, res) => {
  const { amount } = req.body;

  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: "CAPTURE",
    purchase_units: [{
      amount: {
        currency_code: "USD",
        value: amount || "3.00"
      }
    }]
  });

  try {
    const order = await client.execute(request);
    res.status(200).json({
      id: order.result.id, // Este ID se usa en Flutter para autorizar el pago
      links: order.result.links,
    });
  } catch (error) {
    console.error("PayPal error:", error);
    res.status(500).json({ error: "Error creando orden de PayPal" });
  }
});

module.exports = router;
