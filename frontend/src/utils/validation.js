export function validateEmployee(emp) {
  const errors = {};

  if (!emp.name || emp.name.trim() === "") {
    errors.name = "Name is required";
  }

  if (!emp.position || emp.position.trim() === "") {
    errors.position = "Position is required";
  }

  if (!emp.phone || emp.phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else if (!/^[0-9+\- ]+$/.test(emp.phone)) {
    errors.phone = "Invalid phone number format";
  }

  return errors;
}

export function validateCustomer(cust) {
  const errors = {};

  if (!cust.name || cust.name.trim() === "") {
    errors.name = "Name is required";
  }

  if (!cust.phone || cust.phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else if (!/^[0-9+\- ]+$/.test(cust.phone)) {
    errors.phone = "Invalid phone number format";
  }

  if (!cust.email || cust.email.trim() === "") {
    errors.email = "Email is required";
  } else if (!cust.email.includes("@")) {
    errors.email = "Invalid email format";
  }

  return errors;
}

export function validateSupplier(supp) {
  const errors = {};

  if (!supp.name || supp.name.trim() === "") {
    errors.name = "Supplier name is required";
  }

  if (!supp.contact || supp.contact.trim() === "") {
    errors.contact = "Contact person is required";
  }

  if (!supp.phone || supp.phone.trim() === "") {
    errors.phone = "Phone number is required";
  } else if (!/^[0-9+\- ]+$/.test(supp.phone)) {
    errors.phone = "Invalid phone number format";
  }

  if (supp.email && !supp.email.includes("@")) {
    errors.email = "Invalid email format";
  }

  return errors;
}

export function validateProduct(prod) {
  const errors = {};

  if (!prod.name || prod.name.trim() === "") {
    errors.name = "Product name is required";
  }

  if (!prod.category || prod.category.trim() === "") {
    errors.category = "Category is required";
  }

  if (prod.price === "" || prod.price === null) {
    errors.price = "Price is required";
  } else if (isNaN(Number(prod.price))) {
    errors.price = "Price must be a number";
  }

  if (!prod.unit || prod.unit.trim() === "") {
    errors.unit = "Unit is required";
  }

  if (prod.stock === "" || prod.stock === null) {
    errors.stock = "Stock is required";
  } else if (isNaN(Number(prod.stock))) {
    errors.stock = "Stock must be a number";
  }

  return errors;
}

export function validateInventory(inv) {
  const errors = {};

  if (!inv.product || inv.product.trim() === "") {
    errors.product = "Product is required";
  }

  if (inv.quantity === "" || inv.quantity === null) {
    errors.quantity = "Quantity is required";
  } else if (isNaN(Number(inv.quantity))) {
    errors.quantity = "Quantity must be a number";
  }

  if (!inv.type || inv.type.trim() === "") {
    errors.type = "Type is required";
  }

  if (!inv.date || inv.date.trim() === "") {
    errors.date = "Date is required";
  }

  return errors;
}

export function validateSales(sale) {
  const errors = {};

  if (!sale.customer || sale.customer.trim() === "") {
    errors.customer = "Customer is required";
  }

  if (!sale.item || sale.item.trim() === "") {
    errors.item = "Item is required";
  }

  if (sale.quantity === "" || sale.quantity === null) {
    errors.quantity = "Quantity is required";
  } else if (isNaN(Number(sale.quantity))) {
    errors.quantity = "Quantity must be a number";
  }

  if (sale.price === "" || sale.price === null) {
    errors.price = "Price is required";
  } else if (isNaN(Number(sale.price))) {
    errors.price = "Price must be a number";
  }

  if (!sale.date || sale.date.trim() === "") {
    errors.date = "Date is required";
  }

  return errors;
}

export function validatePurchase(pur) {
  const errors = {};

  if (!pur.supplier || pur.supplier.trim() === "") {
    errors.supplier = "Supplier is required";
  }

  if (!pur.item || pur.item.trim() === "") {
    errors.item = "Item is required";
  }

  if (pur.quantity === "" || pur.quantity === null) {
    errors.quantity = "Quantity is required";
  } else if (isNaN(Number(pur.quantity))) {
    errors.quantity = "Quantity must be a number";
  }

  if (pur.price === "" || pur.price === null) {
    errors.price = "Price is required";
  } else if (isNaN(Number(pur.price))) {
    errors.price = "Price must be a number";
  }

  if (!pur.date || pur.date.trim() === "") {
    errors.date = "Date is required";
  }

  return errors;
}
