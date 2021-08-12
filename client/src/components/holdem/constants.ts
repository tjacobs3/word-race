export const ACTION__START_ROUND = 'start_round';
export const ACTION__END_ROUND = 'end_round';
export const ACTION__ADMIN_ADD_AI = 'add_ai';
export const ACTION__CALL = 'action_call';
export const ACTION__CHECK = 'action_check';
export const ACTION__FOLD = 'action_fold';
export const ACTION__RAISE = 'action_raise';
export const ACTION__REVEAL = 'action_reveal';
export const ACTION__MUCK = 'action_muck';
export const ACTION__WAIT_FOR_PLAYERS = 'wait_for_players';
export const ACTION__OWNER_CHANGE_GAME_SETTINGS = 'action_owner_change_game_settings';
export const ACTION__OWNER_GIVE_CHIPS = 'action_owner_give_chips';
export const ACTION__OWNER_TAKE_CHIPS = 'action_owner_take_chips';
export const ACTION__SIT = 'action_sit';
export const ACTION__STAND = 'action_stand';

export interface Player {
  id: string;
  name: string;
  chips: number;
}

export interface Round {
  showdown: boolean;
}

export interface GameSettings {
  chipValue: number;
  smallBlindAmount: number;
  bigBlindAmount: number;
}
