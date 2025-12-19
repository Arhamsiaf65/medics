# Fix imports script
$files = @(
    @{Path="lib\features\pharmacy\views\drugdetail.dart"; Old=@("package:pharmacy/widgets/customappbar.dart", "package:pharmacy/models/drugmodel.dart", "package:pharmacy/views/cartpage.dart", "package:pharmacy/viewmodels/cart_viewmodel.dart", "package:pharmacy/viewmodels/drugdetail_viewmodel.dart"); New=@("package:pharmacy/core/widgets/customappbar.dart", "package:pharmacy/features/pharmacy/data/models/drugmodel.dart", "package:pharmacy/features/pharmacy/views/cartpage.dart", "package:pharmacy/features/pharmacy/viewmodels/cart_viewmodel.dart", "package:pharmacy/features/pharmacy/viewmodels/drugdetail_viewmodel.dart")},
    @{Path="lib\features\pharmacy\views\cartpage.dart"; Old=@("package:pharmacy/viewmodels/cart_viewmodel.dart", "package:pharmacy/widgets/customappbar.dart"); New=@("package:pharmacy/features/pharmacy/viewmodels/cart_viewmodel.dart", "package:pharmacy/core/widgets/customappbar.dart")},
    @{Path="lib\features\pharmacy\widgets\productcard.dart"; Old=@("package:pharmacy/models/drugmodel.dart", "package:pharmacy/views/drugdetail.dart"); New=@("package:pharmacy/features/pharmacy/data/models/drugmodel.dart", "package:pharmacy/features/pharmacy/views/drugdetail.dart")},
    @{Path="lib\features\pharmacy\viewmodels\pharmacy_viewmodel.dart"; Old=@("package:pharmacy/models/drugmodel.dart"); New=@("package:pharmacy/features/pharmacy/data/models/drugmodel.dart")},
    @{Path="lib\features\pharmacy\viewmodels\cart_viewmodel.dart"; Old=@("package:pharmacy/models/drugmodel.dart"); New=@("package:pharmacy/features/pharmacy/data/models/drugmodel.dart")},
    @{Path="lib\features\auth\viewmodels\login_viewmodel.dart"; Old=@("package:pharmacy/models/user_model.dart"); New=@("package:pharmacy/features/auth/data/models/user_model.dart")},
    @{Path="lib\features\articles\views\articles.dart"; Old=@("package:pharmacy/views/pharmacy.dart", "package:pharmacy/widgets/customappbar.dart", "package:pharmacy/widgets/customsearchbar.dart", "package:pharmacy/widgets/populararticlescategorylist.dart", "package:pharmacy/widgets/articlecard.dart", "package:pharmacy/models/articlecardmodel.dart", "package:pharmacy/widgets/relatedarticlescard.dart"); New=@("package:pharmacy/features/pharmacy/views/pharmacy.dart", "package:pharmacy/core/widgets/customappbar.dart", "package:pharmacy/core/widgets/customsearchbar.dart", "package:pharmacy/features/articles/widgets/populararticlescategorylist.dart", "package:pharmacy/features/articles/widgets/articlecard.dart", "package:pharmacy/features/articles/models/articlecardmodel.dart", "package:pharmacy/features/articles/widgets/relatedarticlescard.dart")},
    @{Path="lib\features\articles\views\articledetail.dart"; Old=@("package:pharmacy/models/articlecardmodel.dart", "package:pharmacy/widgets/customappbar.dart"); New=@("package:pharmacy/features/articles/models/articlecardmodel.dart", "package:pharmacy/core/widgets/customappbar.dart")}
)

foreach ($file in $files) {
    $content = Get-Content $file.Path -Raw
    for ($i = 0; $i -lt $file.Old.Length; $i++) {
        $content = $content -replace [regex]::Escape($file.Old[$i]), $file.New[$i]
    }
    Set-Content -Path $file.Path -Value $content -NoNewline
    Write-Host "Fixed: $($file.Path)"
}

Write-Host "All imports fixed!"
