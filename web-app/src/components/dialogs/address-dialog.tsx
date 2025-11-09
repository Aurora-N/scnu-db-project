import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (address: string) => Promise<void>;
  itemCount: number;
  totalAmount: number;
}

export default function AddressDialog({
  open,
  onOpenChange,
  onConfirm,
  itemCount,
  totalAmount,
}: AddressDialogProps) {
  const [shippingAddress, setShippingAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (!shippingAddress.trim()) {
      toast.error('请输入收货地址');
      return;
    }

    try {
      setIsSubmitting(true);
      await onConfirm(shippingAddress.trim());
      // Reset address after successful submission
      setShippingAddress('');
    } catch (error) {
      // Error handling is done in parent component
      console.error('Failed to confirm address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setShippingAddress('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>填写收货地址</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="address">收货地址</Label>
            <Textarea
              id="address"
              placeholder="请输入详细的收货地址，包括省市区、街道、门牌号等"
              value={shippingAddress}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                setShippingAddress(e.target.value)
              }
              rows={4}
              className="resize-none"
            />
          </div>
          <div className="rounded-lg bg-secondary p-4 text-sm">
            <div className="mb-2 font-semibold">订单摘要</div>
            <div className="space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>商品数量</span>
                <span>{itemCount} 件</span>
              </div>
              <div className="flex justify-between">
                <span>总金额</span>
                <span className="font-semibold text-foreground">
                  ¥{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            取消
          </Button>
          <Button onClick={handleConfirm} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? '创建订单中...' : '确认下单'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
