import * as Leaflet from 'leaflet';

import { environment } from '@eview/core/environments/environment';
const defaults = environment.defaults;

export const customIcon = ({
  color,
  icon
}: {
  color: string;
  icon: string;
}): Leaflet.DivIcon => {
  return Leaflet.divIcon({
    html: `<i class="${icon}" style="font-size: 48px; color: ${color}; text-shadow: 0 0 2px black; opacity: 1;"></i>`,
    className: '',
    iconAnchor: [14, 44]
  });
};

export const defaultIcon = customIcon({
  color: defaults.tagColor,
  icon: defaults.tagIcon
});
export const userCursorIcon = customIcon({
  color: 'white',
  icon: defaults.tagIcon
});
export const clickedIcon = userCursorIcon;
