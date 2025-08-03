import { toast } from 'sonner';

const openToast = ({
  type = 'info',
  text,
}: {
  type?: 'success' | 'danger' | 'info';
  text: string;
}) => {
  if (type === 'success') {
    return toast.success(text);
  }
  if (type === 'danger') {
    return toast.warning(text);
  }

  return toast.info(text);
};

export { openToast };
