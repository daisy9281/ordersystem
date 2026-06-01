interface OrderStatusProps {
  status: string;
}

export const OrderStatus = ({ status }: OrderStatusProps) => {
  const steps = [
    { status: 'pending', label: '待支付' },
    { status: 'paid', label: '已支付' },
    { status: 'preparing', label: '制作中' },
    { status: 'ready', label: '待取货' },
    { status: 'completed', label: '已完成' },
  ];

  const currentIndex = steps.findIndex((step) => step.status === status);

  return (
    <div className="flex items-center justify-center py-8">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isCompleted = index <= currentIndex;

        return (
          <div key={step.status} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  isActive
                    ? 'bg-orange-500 text-white'
                    : isCompleted
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-400'
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`text-xs mt-2 ${
                  isActive ? 'text-orange-500 font-semibold' : isCompleted ? 'text-green-500' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </div>
        );
      })}
    </div>
  );
};