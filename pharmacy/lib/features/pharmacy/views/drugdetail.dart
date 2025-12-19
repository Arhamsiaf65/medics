import 'package:flutter/material.dart';
import 'package:pharmacy/core/widgets/customappbar.dart';
import 'package:iconly/iconly.dart';
import 'package:pharmacy/features/pharmacy/data/models/drugmodel.dart';
import 'package:pharmacy/features/pharmacy/views/cartpage.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/pharmacy/viewmodels/cart_viewmodel.dart';
import 'package:pharmacy/features/pharmacy/viewmodels/drugdetail_viewmodel.dart';

class DrugDetail extends StatelessWidget {
  final Drug drug;

  const DrugDetail({
    super.key,
    required this.drug
  });

  void _addToCartAndNavigate(BuildContext context, Drug drug, int quantity) {
    final cartViewModel = Provider.of<CartViewModel>(context, listen: false);
    cartViewModel.addToCart(drug, quantity);

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CartPage(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => DrugDetailViewModel(),
      child: Scaffold(
        appBar: CustomAppbar(
          leading: Icons.chevron_left,
          text: "Drug Details",
          trailing: IconlyLight.buy,
          leadingCallBack: () => Navigator.pop(context),
          trailingCallBack: () => Navigator.push(context, MaterialPageRoute(builder: (context) => CartPage())),
        ),
        body: Consumer<DrugDetailViewModel>(
          builder: (context, viewModel, child) {
            final double totalPrice = viewModel.calculateTotalPrice(drug.actualPrice);

            return SingleChildScrollView(
              child: Column(
                children: [
                  Container(
                      width: double.infinity,
                      height: 250,
                      color: Colors.white,
                      child: Center(
                        child: Image.asset(
                          drug.imgUrl,
                          height: 170,
                          width: 170,
                          fit: BoxFit.contain,
                        ),
                      )
                  ),

                  // name section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 25.0, vertical: 20),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(drug.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w600),),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(drug.items),
                            const Icon(IconlyBold.heart, color: Colors.red,),
                          ],
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.start,
                          children: [
                            // RATING STARS
                            for (int i = 0; i < 4; i++)
                              const Padding(
                                padding: EdgeInsets.only(right: 2.0),
                                child: Icon(IconlyBold.star, color: Color(0xFF199A8E), size: 15),
                              ),
                            const SizedBox(width: 5),

                            Text(
                              drug.rating?.toStringAsFixed(1) ?? "4.0",
                              style: const TextStyle(
                                  color: Color(0xFF199A8E),
                                  fontSize: 14,
                                  fontWeight: FontWeight.bold
                              ),
                            ),
                          ],
                        )
                      ],
                    ),
                  ),

                  // description section
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 25.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                            "Description",
                            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)
                        ),
                        const SizedBox(height: 10),
                        Text(
                          drug.desc,
                          maxLines: viewModel.isExpanded ? null : 4,
                          overflow: viewModel.isExpanded ? TextOverflow.visible : TextOverflow.ellipsis,
                          style: const TextStyle(fontSize: 15, color: Color(0xFFADADAD)),
                        ),

                        if (drug.desc.length > 100)
                          GestureDetector(
                            onTap: viewModel.toggleDescription,
                            child: Padding(
                              padding: const EdgeInsets.only(top: 4.0),
                              child: Text(
                                viewModel.isExpanded ? 'Read less' : 'Read more',
                                style: const TextStyle(
                                  color: Color(0xFF199A8E),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),

                  // quantity and price
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 25.0, vertical: 20),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        // Quantity Control Group
                        Row(
                          children: [
                            GestureDetector(
                              onTap: viewModel.decrementQuantity,
                              child: _buildMinusIcon(),
                            ),

                            const SizedBox(width: 15),

                            Text(
                              viewModel.quantity.toString(),
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),

                            const SizedBox(width: 15),

                            GestureDetector(
                              onTap: viewModel.incrementQuantity,
                              child: _buildPlusIcon(),
                            ),
                          ],
                        ),

                        // Total Price
                        Text(
                          '\$${totalPrice.toStringAsFixed(2)}',
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w800,
                            color: Color(0xFF199A8E),
                          ),
                        ),
                      ],
                    ),
                  )
                ],
              ),
            );
          },
        ),

        bottomNavigationBar: Consumer<DrugDetailViewModel>(
          builder: (context, viewModel, child) {
            return Container(
              height: 100,
              padding: const EdgeInsets.symmetric(horizontal: 25.0, vertical: 15),
              decoration: const BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black12,
                    blurRadius: 10,
                    offset: Offset(0, -5),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    height: 55,
                    width: 60,
                    decoration: BoxDecoration(
                      color: Color(0xFFE8F3F1),
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: IconButton(
                      icon: const Icon(IconlyLight.buy, color: Color(0xFF199A8E), size: 30),
                      onPressed: () {
                        _addToCartAndNavigate(context, drug, viewModel.quantity);
                      },
                    ),
                  ),

                  const SizedBox(width: 15),

                  Expanded(
                    child: Container(
                      height: 55,
                      child: ElevatedButton(
                        onPressed: () {
                          _addToCartAndNavigate(context, drug, viewModel.quantity);
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF199A8E),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(15),
                          ),
                          elevation: 0,
                        ),
                        child: const Text(
                          "Buy Now",
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
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildPlusIcon() {
    return Stack(
      alignment: Alignment.center,
      children: [
        Container(
          height: 30,
          width: 30,
          decoration: BoxDecoration(
            color: const Color(0xFF199A8E),
            borderRadius: BorderRadius.circular(8),
          ),
        ),
        Image.asset("assets/images/horizontalvector.png", height: 10, width: 10,),
        Image.asset("assets/images/verticalvector.png", height: 10, width: 10,),
      ],
    );
  }

  Widget _buildMinusIcon() {
    return Container(
      height: 30,
      width: 30,
      decoration: BoxDecoration(
        color: Colors.grey,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Image.asset("assets/images/horizontalvector.png", height: 10, width: 10,),
    );
  }
}



