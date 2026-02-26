import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../config/app_colors.dart';
import '../models/user.dart';
import '../models/watch_platform.dart';
import '../services/watch_service.dart';

class WatchTab extends StatefulWidget {
  final User user;

  const WatchTab({super.key, required this.user});

  @override
  State<WatchTab> createState() => _WatchTabState();
}

class _WatchTabState extends State<WatchTab> {
  final _watchService = WatchService();
  List<WatchPlatform> _platforms = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadPlatforms();
  }

  Future<void> _loadPlatforms() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final platforms = await _watchService.getWatchPlatforms();
      setState(() {
        _platforms = platforms;
        _isLoading = false;
      });
    } catch (e) {
      print('Error loading watch platforms: $e');
      setState(() {
        _error = e.toString();
        _isLoading = false;
      });
    }
  }

  Future<void> _openPlatform(String url) async {
    final uri = Uri.parse(url);
    
    try {
      if (await canLaunchUrl(uri)) {
        await launchUrl(uri, mode: LaunchMode.externalApplication);
      } else {
        throw Exception('Could not launch platform');
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Could not open platform: ${e.toString()}'),
          backgroundColor: AppColors.errorRed,
        ),
      );
    }
  }

  String _getTitle() {
    final lang = widget.user.language;
    if (lang == 'am') return 'የት እንደሚመለከቱ';
    if (lang == 'om') return 'Eessa Ilaaluu';
    return 'Where to Watch';
  }

  String _getSubtitle() {
    final lang = widget.user.language;
    if (lang == 'am') return 'ግጥሚያዎችን ለመመልከት የሚመከሩ መድረኮች';
    if (lang == 'om') return 'Waltajjiiwwan tajaajila dhiyeessan';
    return 'Recommended streaming platforms';
  }

  String _getEmptyMessage() {
    final lang = widget.user.language;
    if (lang == 'am') return 'ምንም መድረክ የለም';
    if (lang == 'om') return 'Waltajjiin hin jiru';
    return 'No platforms available';
  }

  String _getTypeLabel(String type) {
    final lang = widget.user.language;
    
    switch (type) {
      case 'streaming':
        if (lang == 'am') return 'የስትሪሚንግ አገልግሎት';
        if (lang == 'om') return 'Tajaajila Streaming';
        return 'Streaming Service';
      case 'tv_channel':
        if (lang == 'am') return 'የቴሌቪዥን ቻናል';
        if (lang == 'om') return 'Chaanaalii TV';
        return 'TV Channel';
      case 'website':
        if (lang == 'am') return 'ድረ-ገጽ';
        if (lang == 'om') return 'Marsariitii';
        return 'Website';
      default:
        return type;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(gradient: AppColors.backgroundGradient),
      child: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: AppColors.buttonGreenEnd),
            )
          : _error != null
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.error_outline, size: 64, color: AppColors.errorRed),
                      const SizedBox(height: 16),
                      const Text(
                        'Failed to load platforms',
                        style: TextStyle(color: Colors.white, fontSize: 18),
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Please check your connection',
                        style: TextStyle(color: AppColors.textGrey),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _loadPlatforms,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.accentGreen,
                        ),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                )
              : _platforms.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.tv, size: 64, color: AppColors.textGrey),
                          const SizedBox(height: 16),
                          Text(
                            _getEmptyMessage(),
                            style: const TextStyle(color: Colors.white, fontSize: 18),
                          ),
                        ],
                      ),
                    )
                  : RefreshIndicator(
                      onRefresh: _loadPlatforms,
                      color: AppColors.buttonGreenEnd,
                      child: CustomScrollView(
                        slivers: [
                          SliverToBoxAdapter(
                            child: Padding(
                              padding: const EdgeInsets.all(20),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _getTitle(),
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 28,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    _getSubtitle(),
                                    style: const TextStyle(
                                      color: AppColors.textGrey,
                                      fontSize: 16,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          SliverPadding(
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            sliver: SliverGrid(
                              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                childAspectRatio: 0.85,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                              ),
                              delegate: SliverChildBuilderDelegate(
                                (context, index) {
                                  final platform = _platforms[index];
                                  return _buildPlatformCard(platform);
                                },
                                childCount: _platforms.length,
                              ),
                            ),
                          ),
                          const SliverToBoxAdapter(
                            child: SizedBox(height: 20),
                          ),
                        ],
                      ),
                    ),
    );
  }

  Widget _buildPlatformCard(WatchPlatform platform) {
    return Card(
      color: AppColors.inputBackground,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => _openPlatform(platform.url),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // Logo section
            Expanded(
              flex: 3,
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.all(20),
                child: platform.logoUrl.isNotEmpty
                    ? Image.network(
                        platform.logoUrl,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) => const Icon(
                          Icons.tv,
                          size: 48,
                          color: AppColors.textGrey,
                        ),
                      )
                    : const Icon(
                        Icons.tv,
                        size: 48,
                        color: AppColors.textGrey,
                      ),
              ),
            ),
            // Info section
            Expanded(
              flex: 2,
              child: Container(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      platform.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.accentGreen,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        _getTypeLabel(platform.type),
                        style: const TextStyle(
                          color: AppColors.buttonGreenEnd,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
