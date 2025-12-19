import 'package:flutter/material.dart';
import 'package:pharmacy/features/pharmacy/data/models/drugmodel.dart';
import 'package:pharmacy/features/pharmacy/views/drugdetail.dart';

class ProductCard extends StatelessWidget{
  final Drug drug;


  const ProductCard({
    required this.drug
  });


  @override
  Widget build(BuildContext context) {
    // Determine if the product is on sale: saleprice must be non-null and less than actualPrice
    final bool isOnSale = drug.saleprice != null && drug.saleprice! < drug.actualPrice;
    // Determine the price to display as the main, non-strikethrough price
    final int mainPrice = drug.saleprice ?? drug.actualPrice;


    return Container(
      width: 150,
      // Add a margin to separate cards when used in a horizontal list
      margin: const EdgeInsets.only(right: 15.0),
      child: GestureDetector(
        onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => DrugDetail(drug: drug),)),
        child: Card(
          color: Colors.white,
          elevation: 1, // Added a slight shadow for better separation
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0 , horizontal: 10),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.start,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                    width: double.infinity,
                    height: 100,
                    // Use BoxFit.contain or similar to prevent distortion
                    child: Image.asset(drug.imgUrl, fit: BoxFit.contain,)),
                Text(drug.name, style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15),),
                Text(drug.items, style: TextStyle(color: Color(0xFFADADAD),fontWeight: FontWeight.w500, fontSize: 10),),
                SizedBox(height: 10,),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Price Section
                    Row(
                      children: [
                        // 1. Display the main/sale price (bold)
                        Text(
                          // Assuming you want a currency symbol, using $ as an example
                          '\$${mainPrice.toString()}',
                          style: TextStyle(
                            fontWeight: FontWeight.w800,
                            // Highlight the main price if it's a sale price
                            fontSize: 14,
                          ),
                        ),

                        const SizedBox(width: 5), // Spacer between prices

                        // 2. Conditionally display the actual/original price with strikethrough
                        if (isOnSale)
                          Text(
                            '\$${drug.actualPrice!.toString()}',
                            style: TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 12,
                              color: const Color(0xFFADADAD), // Gray color
                              decoration: TextDecoration.lineThrough, // **Strikethrough effect**
                            ),
                          ),
                      ],
                    ),

                    // Plus Button
                    Stack(
                      alignment: Alignment.center, // centers everything
                      children: [
                        Image.asset("assets/images/rectangle.png"), // background shape

                        // vertical line of the plus
                        Positioned(
                          child: Image.asset(
                            "assets/images/verticalvector.png",
                            width: 20,
                            height: 20,
                          ),
                        ),

                        // horizontal line of the plus
                        Positioned(
                          child: Image.asset(
                            "assets/images/horizontalvector.png",
                            width: 20,
                            height: 20,
                          ),
                        ),

                      ],
                    )
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}