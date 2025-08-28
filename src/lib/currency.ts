export function rupeesToPaise(rupees: number) {
  return Math.round(rupees * 100);
}

export function paiseToRupees(paise: number) {
  return (paise || 0) / 100;
}

export function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(paiseToRupees(paise));
}
