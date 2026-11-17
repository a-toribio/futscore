package com.futscore.app;

import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.activity.result.ActivityResult;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@CapacitorPlugin(name = "AppUpdater")
public class AppUpdaterPlugin extends Plugin {

    private final ExecutorService executor = Executors.newSingleThreadExecutor();

    @PluginMethod
    public void getAppInfo(PluginCall call) {
        try {
            PackageInfo info = getContext()
                .getPackageManager()
                .getPackageInfo(getContext().getPackageName(), 0);
            long versionCode = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
                ? info.getLongVersionCode()
                : info.versionCode;

            JSObject ret = new JSObject();
            ret.put("versionName", info.versionName != null ? info.versionName : "1.0.0");
            ret.put("versionCode", versionCode);
            ret.put("lastUpdateTime", info.lastUpdateTime);
            call.resolve(ret);
        } catch (PackageManager.NameNotFoundException e) {
            call.reject("No se pudo obtener la versión instalada: " + e.getMessage());
        }
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url");
        if (url == null || !url.startsWith("https://")) {
            call.reject("URL de actualización no válida.");
            return;
        }

        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !getContext().getPackageManager().canRequestPackageInstalls()
        ) {
            Intent intent = new Intent(
                Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName())
            );
            startActivityForResult(call, intent, "onInstallPermissionResult");
            return;
        }

        startDownloadAndInstall(call, url);
    }

    @ActivityCallback
    private void onInstallPermissionResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }
        if (
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !getContext().getPackageManager().canRequestPackageInstalls()
        ) {
            call.reject("Es necesario permitir la instalación de aplicaciones desde FutScore para actualizar.");
            return;
        }
        String url = call.getString("url");
        if (url == null || !url.startsWith("https://")) {
            call.reject("URL de actualización no válida.");
            return;
        }
        startDownloadAndInstall(call, url);
    }

    private void startDownloadAndInstall(PluginCall call, String downloadUrl) {
        executor.execute(() -> {
            HttpURLConnection conn = null;
            File cacheDir = getContext().getCacheDir();
            File tempFile = new File(cacheDir, "FutScore-update.apk.part");
            File apkFile = new File(cacheDir, "FutScore-update.apk");

            try {
                conn = openFollowingRedirects(downloadUrl, 5);
                int status = conn.getResponseCode();
                if (status < 200 || status >= 300) {
                    call.reject("Error al descargar el APK (HTTP " + status + ")");
                    return;
                }

                long totalBytes = conn.getContentLengthLong();
                long downloadedBytes = 0;
                int lastPercent = -1;
                long lastNotifyAt = 0;

                try (
                    InputStream in = new BufferedInputStream(conn.getInputStream());
                    FileOutputStream out = new FileOutputStream(tempFile)
                ) {
                    byte[] buffer = new byte[16 * 1024];
                    int read;
                    while ((read = in.read(buffer)) != -1) {
                        out.write(buffer, 0, read);
                        downloadedBytes += read;

                        int percent = totalBytes > 0
                            ? (int) Math.min(100, (downloadedBytes * 100L) / totalBytes)
                            : -1;
                        long now = System.currentTimeMillis();
                        if (percent != lastPercent && (now - lastNotifyAt >= 150 || percent == 100)) {
                            lastPercent = percent;
                            lastNotifyAt = now;
                            emitProgress(percent, downloadedBytes, totalBytes);
                        }
                    }
                    out.flush();
                }

                if (apkFile.exists()) {
                    apkFile.delete();
                }
                if (!tempFile.renameTo(apkFile)) {
                    call.reject("No se pudo preparar el archivo APK descargado.");
                    return;
                }

                emitProgress(100, downloadedBytes, totalBytes > 0 ? totalBytes : downloadedBytes);

                Uri apkUri = FileProvider.getUriForFile(
                    getContext(),
                    getContext().getPackageName() + ".fileprovider",
                    apkFile
                );

                Intent installIntent = new Intent(Intent.ACTION_VIEW);
                installIntent.setDataAndType(apkUri, "application/vnd.android.package-archive");
                installIntent.addFlags(
                    Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK
                );

                getActivity().runOnUiThread(() -> {
                    getActivity().startActivity(installIntent);
                    JSObject ret = new JSObject();
                    ret.put("started", true);
                    call.resolve(ret);
                });
            } catch (Exception e) {
                if (tempFile.exists()) {
                    tempFile.delete();
                }
                call.reject("No se pudo descargar la actualización: " + e.getMessage());
            } finally {
                if (conn != null) {
                    conn.disconnect();
                }
            }
        });
    }

    private void emitProgress(int percent, long downloadedBytes, long totalBytes) {
        JSObject data = new JSObject();
        data.put("percent", percent);
        data.put("downloadedBytes", downloadedBytes);
        data.put("totalBytes", totalBytes);
        notifyListeners("downloadProgress", data, false);
    }

    private HttpURLConnection openFollowingRedirects(String urlStr, int maxRedirects) throws Exception {
        String current = urlStr;
        for (int i = 0; i <= maxRedirects; i++) {
            URL url = new URL(current);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setInstanceFollowRedirects(false);
            conn.setConnectTimeout(15_000);
            conn.setReadTimeout(30_000);
            conn.setRequestProperty("User-Agent", "FutScore-Android");
            int code = conn.getResponseCode();
            if (
                code == HttpURLConnection.HTTP_MOVED_PERM ||
                code == HttpURLConnection.HTTP_MOVED_TEMP ||
                code == HttpURLConnection.HTTP_SEE_OTHER ||
                code == 307 ||
                code == 308
            ) {
                String location = conn.getHeaderField("Location");
                conn.disconnect();
                if (location == null || location.isEmpty()) {
                    throw new IllegalStateException("Redirección sin destino");
                }
                current = new URL(url, location).toString();
                continue;
            }
            return conn;
        }
        throw new IllegalStateException("Demasiadas redirecciones al descargar el APK");
    }
}
