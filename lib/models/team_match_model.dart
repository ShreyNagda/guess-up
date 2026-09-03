import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:guess_up/models/team_match_state.dart';

part 'team_match_model.freezed.dart';

@freezed
class TeamMatchModel with _$TeamMatchModel {
  const factory TeamMatchModel({
    @Default(false) bool isTeamMode,
    @Default(TeamColor.cyan) TeamColor currentTeam,
    TeamColor? lastPlayingTeam,
    @Default(0) int teamCyanScore,
    @Default(0) int teamMagentaScore,
    @Default(1) int currentRound,
    @Default(3) int maxRounds,
    @Default(false) bool isMatchFinished,
    @Default(false) bool isTiebreaker,
  }) = _TeamMatchModel;
}
