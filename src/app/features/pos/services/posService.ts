import { supabase } from "../../../utils/supabase";
import type { Product } from "../types";

export interface StaffProfile {
  username: string;
  branchId: number;
}

export async function fetchStaffProfile(staffId: string) {
  const { data, error } = await supabase
    .from("staff")
    .select("username, branch_id")
    .eq("staff_id", staffId)
    .single();

  if (error || !data) {
    return { data: null, error };
  }

  const { username, branch_id: branchId } = data;
  if (typeof username !== "string" || typeof branchId !== "number") {
    return { data: null, error: new Error("Invalid staff profile response.") };
  }

  return { data: { username, branchId }, error: null };
}

export async function fetchBranchProducts(branchId: number) {
  const { data, error } = await supabase
    .from("branch_product_prices")
    .select("price, product:products(product_id, product_name, weight_kg, active)")
    .eq("branch_id", branchId);

  if (error || !data) {
    return { data: [], error };
  }

  const rows = Array.isArray(data) ? data : [];
  const mappedProducts = rows.flatMap((row) => {
    if (!row?.product || row.product.active === false) {
      return [];
    }

    const { product_id: productId, product_name: productName, weight_kg: weightKg } = row.product;

    if (typeof productId !== "number" || typeof productName !== "string" || typeof weightKg !== "number") {
      return [];
    }

    const price = typeof row.price === "number" ? row.price : Number(row.price);
    if (Number.isNaN(price)) {
      return [];
    }

    const product: Product = {
      id: productId,
      name: productName,
      price,
      weight: `${weightKg}kg`,
    };

    return [product];
  });

  return { data: mappedProducts, error: null };
}

export async function updateBranchProductPrice(branchId: number, productId: number, price: number) {
  const { error } = await supabase
    .from("branch_product_prices")
    .upsert(
      { branch_id: branchId, product_id: productId, price },
      { onConflict: "branch_id,product_id" },
    );

  return { error };
}
