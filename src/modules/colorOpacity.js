import color from 'color';

export const colorOpacity = (value, opacity = 0.5) => color(value).alpha(opacity).string();
