import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:guess_up/screens/game_config_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    SystemChrome.setPreferredOrientations([DeviceOrientation.portraitUp]);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Scaffold(
        body: Padding(
          padding: EdgeInsets.all(32),
          child: Center(
            child: Column(
              children: [
                SizedBox(height: 20),
                Text(
                  "GUESS UP",
                  style: Theme.of(
                    context,
                  ).textTheme.headlineLarge!.copyWith(letterSpacing: 2),
                ),
                Text(
                  "Act, Hint, Laugh",
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                Spacer(),
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    elevation: 10,
                    iconSize: 25,
                    textStyle: Theme.of(context).textTheme.bodyLarge,
                  ),
                  onPressed: () {
                    Navigator.of(context).push(
                      CupertinoPageRoute(
                        builder: (context) => GameConfigScreen(),
                      ),
                    );
                  },
                  icon: Icon(Icons.play_arrow_rounded),
                  label: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Text("Start Guessing!"),
                  ),
                ),
                // TextButton.icon(
                //   onPressed: () {},
                //   label: Text(
                //     "Settings",
                //     style: Theme.of(context).textTheme.bodyLarge,
                //   ),
                //   icon: Icon(Icons.settings_rounded),
                // ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
