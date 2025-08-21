import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { CreditCard, Lock, CheckCircle, DollarSign } from "lucide-react"

export default function PaymentModal({ isOpen, onClose, appointmentDetails, onPaymentSuccess }) {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardholderName: "",
    billingAddress: "",
    city: "",
    zipCode: ""
  })

  const sessionPrices = {
    individual: 120,
    couples: 180,
    family: 200,
    group: 80
  }

  const price = sessionPrices[appointmentDetails?.type] || 120
  const tax = Math.round(price * 0.08) // 8% tax
  const total = price + tax

  const handleInputChange = (field, value) => {
    setPaymentData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatCardNumber = (value) => {
    // Remove all non-digits
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    // Add spaces every 4 digits
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Simulate payment processing
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Payment Successful! 🎉",
        description: `Your appointment has been booked and payment of $${total} has been processed.`,
      })

      onPaymentSuccess({
        ...appointmentDetails,
        paymentId: "PAY_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        amount: total,
        paymentMethod,
        status: "paid"
      })

      onClose()

      // Navigate back to dashboard after a short delay
      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Secure Payment</span>
          </DialogTitle>
          <DialogDescription>
            Complete your payment to confirm your therapy appointment
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Appointment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appointment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span>Therapist:</span>
                <span className="font-medium">{appointmentDetails?.therapistName}</span>
              </div>
              <div className="flex justify-between">
                <span>Date & Time:</span>
                <span className="font-medium">{appointmentDetails?.date} at {appointmentDetails?.time}</span>
              </div>
              <div className="flex justify-between">
                <span>Session Type:</span>
                <span className="font-medium capitalize">{appointmentDetails?.type} Session</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between">
                  <span>Session Fee:</span>
                  <span>${price}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (8%):</span>
                  <span>${tax}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span>${total}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="credit-card">Credit Card</SelectItem>
                  <SelectItem value="debit-card">Debit Card</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod !== "paypal" && (
              <>
                {/* Card Details */}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                      maxLength={5}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, '').substring(0, 4))}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardholderName">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    placeholder="John Doe"
                    value={paymentData.cardholderName}
                    onChange={(e) => handleInputChange("cardholderName", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="billingAddress">Billing Address</Label>
                  <Input
                    id="billingAddress"
                    placeholder="123 Main St"
                    value={paymentData.billingAddress}
                    onChange={(e) => handleInputChange("billingAddress", e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="New York"
                      value={paymentData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      placeholder="10001"
                      value={paymentData.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value.replace(/\D/g, '').substring(0, 5))}
                      maxLength={5}
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* Security Notice */}
            <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
              <Lock className="h-4 w-4" />
              <span>Your payment information is secure and encrypted</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? "Processing..." : `Pay $${total}`}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
