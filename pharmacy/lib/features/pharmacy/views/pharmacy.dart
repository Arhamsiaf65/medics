import 'package:flutter/material.dart';
import 'package:pharmacy/core/widgets/customappbar.dart';
import 'package:iconly/iconly.dart';
import 'package:pharmacy/core/widgets/customsearchbar.dart';
import 'package:pharmacy/features/pharmacy/widgets/productcard.dart';
import 'package:pharmacy/features/articles/views/articles.dart';
import 'package:pharmacy/features/pharmacy/views/cartpage.dart';
import 'package:provider/provider.dart';
import 'package:pharmacy/features/pharmacy/viewmodels/pharmacy_viewmodel.dart';

class PharmacyPage extends StatelessWidget {
  const PharmacyPage({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => PharmacyViewModel(),
      child: const _PharmacyPageContent(),
    );
  }
}

class _PharmacyPageContent extends StatelessWidget {
  const _PharmacyPageContent({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<PharmacyViewModel>(context);

    return Scaffold(
      appBar: CustomAppbar(
        leading: Icons.chevron_left,
        text: "Pharmacy",
        trailing: IconlyLight.buy,
        trailingCallBack: () => Navigator.push(context, MaterialPageRoute(builder: (context) => CartPage())),
      ),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 25, 18, 0),
              child: CustomSearchBar(hintText: "Search drugs, category..."),
            ),

            //   card
            Padding(
              padding: const EdgeInsets.fromLTRB(15, 20, 18, 0),
              child: Stack(
                children: [
                  Container(
                    width: double.infinity,
                    height: 135,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(10),
                      color: const Color(0xFFE8F3F1),
                    ),
                  ),
                  Positioned(
                      right: -30,
                      bottom: -25,
                      child: Image.asset("assets/images/contractrqe1.png", height: 200, width: 250, fit: BoxFit.fill,)),

                  const Positioned(
                    top: 20,
                    left: 30,
                    child: Text("Order quickly with \n Prescription", style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 20,
                    ),),
                  ),

                  Positioned(
                    bottom: 10,
                    left: 30,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        elevation: 0,
                        backgroundColor: const Color(0xFF199A8E),
                        minimumSize: const Size(0, 35),
                        padding: const EdgeInsets.symmetric(horizontal: 10),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                        ),
                      ),
                      onPressed: () {},
                      child: const Text(
                        "Upload Prescription",
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  )
                ],
              ),
            ),

            // popular products section
            Padding(
              padding: const EdgeInsets.fromLTRB(18, 25, 18, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    "Popular Products",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    "See all",
                    style: TextStyle(
                      color: Color(0xFF199A8E),
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(
              height: 190,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 18),
                itemBuilder: (context, index){
                  return ProductCard(drug: viewModel.drugs[index]);
                },
                itemCount: viewModel.drugs.length,
              ),
            ),


            Padding(
              padding: const EdgeInsets.fromLTRB(18, 25, 18, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: const [
                  Text(
                    "Products on Sale",
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  Text(
                    "See all",
                    style: TextStyle(
                      color: Color(0xFF199A8E),
                      fontSize: 16,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 190,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 18),
                itemBuilder: (context, index){
                  return ProductCard(drug: viewModel.drugsOnSale[index]);
                },
                itemCount: viewModel.drugsOnSale.length,
              ),
            ),

          ],
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: viewModel.selectedIndex,
        onTap: (index) {
          if (index == viewModel.selectedIndex) return;
          viewModel.setSelectedIndex(index);
          if (index == 1) {
            Navigator.pushReplacement(
              context,
              MaterialPageRoute(builder: (_) =>  ArticlesPage()),
            );
          }
        },
        selectedItemColor: const Color(0xFF199A8E),
        unselectedItemColor: Colors.grey,
        showUnselectedLabels: true,
        items: const [
          BottomNavigationBarItem(
            icon: Icon(IconlyLight.buy),
            label: 'Pharmacy',
          ),
          BottomNavigationBarItem(
            icon: Icon(IconlyLight.paper),
            label: 'Articles',
          ),
        ],
      ),
    );
  }
}