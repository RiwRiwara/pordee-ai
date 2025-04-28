import { addToast } from "@heroui/toast";

// useCustomToast
export const useCustomToast = () => {
    const showNotification = (
        title: string,
        description: string,
        variant: 'solid' | 'flat' | 'bordered',
        color: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
    ) => {
        addToast({
            title,
            description,
            variant,
            color,
        });
    };

    return { showNotification };
};
