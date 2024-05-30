import { NetworkStatus } from '@eview/core/models/network';

export interface NetworkStatusState {
  networkStatus: NetworkStatus;
}

export const initialNetworkStatusState: NetworkStatusState = {
  networkStatus: null
};
