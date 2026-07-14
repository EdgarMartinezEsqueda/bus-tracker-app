import { Bus, Code2, MessageCircle } from "lucide-react-native";
import React from "react";
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme";

const APP_VERSION = "1.0.0";
const REPO_URL = "https://github.com/EdgarMartinezEsqueda/bus-tracker-app";

interface AboutScreenProps {
  onGoToReport: () => void;
}

const AboutScreen: React.FC<AboutScreenProps> = ({ onGoToReport }) => {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const card = {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.md,
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24 },
      ]}
    >
      <Image
        source={require("../assets/logoFlat.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>
        Tepa Buses
      </Text>
      <Text
        style={[theme.typography.caption, { color: theme.colors.textMuted }]}
      >
        Versión {APP_VERSION}
      </Text>

      <View style={[styles.card, card]}>
        <Bus size={20} color={theme.colors.primary} />
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.text, flex: 1 },
          ]}
        >
          Consulta las rutas y paradas del transporte público de Tepatitlán de
          Morelos, Jalisco. Gratuita, sin cuentas y sin anuncios.
        </Text>
      </View>

      <View style={[styles.card, card]}>
        <Text
          style={[
            theme.typography.caption,
            { color: theme.colors.textMuted, flex: 1 },
          ]}
        >
          Los recorridos se basan en la información pública del sistema de
          transporte (SITRAN, 2017) y se actualizan con ayuda de la comunidad.
          Algunas rutas o paradas pueden haber cambiado.
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.card, card, styles.actionCard]}
        onPress={onGoToReport}
        accessibilityRole="button"
      >
        <MessageCircle size={20} color={theme.colors.primary} />
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
          ¿Algo cambió? Repórtalo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.card, card, styles.actionCard]}
        onPress={() => Linking.openURL(REPO_URL)}
        accessibilityRole="link"
      >
        <Code2 size={20} color={theme.colors.primary} />
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
          Código abierto en GitHub
        </Text>
      </TouchableOpacity>

      <Text
        style={[
          theme.typography.caption,
          { color: theme.colors.textMuted, marginTop: 24 },
        ]}
      >
        Hecho con ♥ en Tepatitlán
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  logo: {
    width: 96,
    height: 96,
    marginBottom: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    marginTop: 16,
    alignSelf: "stretch",
  },
  actionCard: {
    marginTop: 12,
  },
});

export default AboutScreen;
