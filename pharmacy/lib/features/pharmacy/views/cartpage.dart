import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/pharmacy/viewmodels/cart_viewmodel.dart';
import 'package:pharmacy/core/widgets/customappbar.dart';
import 'package:iconly/iconly.dart';

class CartPage extends StatelessWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context) {
    final cartViewModel = Provider.of<CartViewModel>(context);

    if (cartViewModel.cartItems.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("My Cart"),
          backgroundColor: Colors.white,
          elevation: 0,
        ),
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0.8, end: 1.0),
                  duration: const Duration(milliseconds: 600),
                  curve: Curves.easeInOutBack,
                  builder: (context, scale, child) {
                    return Transform.scale(scale: scale, child: child);
                  },
                  child: const Icon(
                    Icons.shopping_cart_outlined,
                    color: Color(0xFF199A8E),
                    size: 100,
                  ),
                ),

                const SizedBox(height: 24),

                const Text(
                  "Your Cart is Empty",
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.black87,
                  ),
                ),

                const SizedBox(height: 10),

                const Text(
                  "Looks like you haven't added any items yet.\nStart shopping now!",
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.black54,
                    height: 1.5,
                  ),
                ),

                const SizedBox(height: 30),

                ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pop(); // Go back to previous page
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF199A8E),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    padding:
                    const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  ),
                  icon: const Icon(Icons.arrow_back_ios_new, color: Colors.white, size: 18),
                  label: const Text(
                    "Continue Shopping",
                    style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }


    return Scaffold(
      appBar: CustomAppbar(leading: Icons.chevron_left,
        text: "My Cart",
      ),
      body:

      SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 18.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.start,
            spacing: 10,
            children: [
              ListView(
                physics: NeverScrollableScrollPhysics(),
                shrinkWrap: true,
                // padding: const EdgeInsets.symmetric(horizontal: 16),
                children: cartViewModel.cartItems.values.map((item) {
                  final drug = item['drug'];
                  final quantity = item['quantity'];
                  return Card(
                    margin: const EdgeInsets.symmetric(vertical: 8),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black12.withOpacity(0.05),
                            blurRadius: 8,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: Image.asset(
                              drug.imgUrl,
                              height: 60,
                              width: 60,
                              fit: BoxFit.cover,
                            ),
                          ),

                          const SizedBox(width: 20),

                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(

                                  children: [
                                    Text(
                                      drug.name,
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),

                                    Spacer(),
                                    // 🗑 Delete icon
                                    GestureDetector(
                                      onTap: () {
                                        Provider.of<CartViewModel>(context, listen: false)
                                            .removeFromCart(drug.name);
                                      },
                                      child: const Icon(Icons.delete_outline, color: Colors.grey),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  drug.items,
                                  style: const TextStyle(
                                    color: Colors.grey,
                                    fontSize: 13,
                                  ),
                                ),

                                const SizedBox(height: 8),

                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Row(
                                      children: [
                                        GestureDetector(
                                          onTap: () {
                                            if (quantity > 1) {
                                              Provider.of<CartViewModel>(context, listen: false)
                                                  .addToCart(drug, -1);
                                            }
                                          },
                                          child: Container(
                                            height: 28,
                                            width: 28,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFFE8F3F1),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Icon(Icons.remove, size: 16, color: Colors.black54),
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        Text(
                                          quantity.toString(),
                                          style: const TextStyle(
                                            fontSize: 16,
                                            fontWeight: FontWeight.w600,
                                          ),
                                        ),
                                        const SizedBox(width: 8),
                                        GestureDetector(
                                          onTap: () {
                                            Provider.of<CartViewModel>(context, listen: false)
                                                .addToCart(drug, 1);
                                          },
                                          child: Container(
                                            height: 28,
                                            width: 28,
                                            decoration: BoxDecoration(
                                              color: const Color(0xFF199A8E),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: const Icon(Icons.add, size: 16, color: Colors.white),
                                          ),
                                        ),
                                      ],
                                    ),

                                  Text(
                                    '\$${(drug.actualPrice ?? 0) * quantity}',
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],),


                              ],
                            ),
                          ),

                          const SizedBox(width: 8),

                        ],
                      ),
                    )
                  );
                }).toList(),
              ),

              Text(
                "Payment Detail",
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Sub Total", style: TextStyle(color: Color(0xFF555555)),),
                  Text("\$" + cartViewModel.totalPrice.toString(), style: TextStyle(color: Color(0xFF555555))),

                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Taxes", style: TextStyle(color: Color(0xFF555555)),),
                  Text("\$0.0", style: TextStyle(color: Color(0xFF555555))),

                ],
              ),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Total", style: TextStyle(color: Color(0xFF555555), fontWeight: FontWeight.bold),),
                  Text("\$" + cartViewModel.totalPrice.toString(), style: TextStyle(color: Color(0xFF555555), fontWeight: FontWeight.bold)),

                ],
              ),

            ],
          ),
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(16),
        child:
        Row(
          children: [
            Text("Total", style: TextStyle(color: Color(0xFFADADAD)),),
            SizedBox(width: 20,),
            Text(
              '\$${cartViewModel.totalPrice.toStringAsFixed(2)}',
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            SizedBox(width: 20,),
            Expanded(
              child: Container(
                height: 55,
                child: ElevatedButton(
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                          contentPadding: const EdgeInsets.symmetric(vertical: 30, horizontal: 40),
                          titlePadding: const EdgeInsets.only(top: 10),
                          title: Column(
                            children: [
                              Padding(
                                padding: const EdgeInsets.all(18.0),
                                child: Container(
                                  decoration: const BoxDecoration(
                                    color: Color(0xFF199A8E),
                                    shape: BoxShape.circle,
                                  ),
                                  padding: const EdgeInsets.all(12),
                                  child: const Icon(
                                    Icons.check,
                                    color: Colors.white,
                                    size: 40,
                                  ),
                                ),
                              ),
                              const SizedBox(height: 12),
                              const Text(
                                "Order Successful!",
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 20,
                                ),
                              ),
                            ],
                          ),
                          content: const Text(
                            "Your order has been placed successfully.\nThank you for shopping with us!",
                            textAlign: TextAlign.center,
                          ),
                          actionsAlignment: MainAxisAlignment.center,
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop(); // Close dialog
                                Provider.of<CartViewModel>(context, listen: false).clearCart(); // Clear cart
                              },
                              child: const Text(
                                "OK",
                                style: TextStyle(
                                  color: Color(0xFF199A8E),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        );

                      },
                    );
                  },


                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF199A8E),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    elevation: 0,
                  ),
                  child: const Text(
                    "Check Out",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ),

          ],
        )






      ),
    );
  }
}
