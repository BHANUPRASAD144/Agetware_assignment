import java.util.Scanner;

public class Problem1 {

    public static String encode(String message, int shift) {
        StringBuilder encoded = new StringBuilder();
        shift = shift % 26;
        for (char c : message.toCharArray()) {
            if (Character.isUpperCase(c)) {
                char ch = (char) (((c - 'A' + shift + 26) % 26) + 'A');
                encoded.append(ch);
            } else if (Character.isLowerCase(c)) {
                char ch = (char) (((c - 'a' + shift + 26) % 26) + 'a');
                encoded.append(ch);
            } else {
                encoded.append(c);
            }
        }
        return encoded.toString();
    }

    public static String decode(String message, int shift) {
        return encode(message, -shift);
    }

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter the message: ");
        String message = scanner.nextLine();
        System.out.print("Enter the shift value: ");
        int shift = scanner.nextInt();
        scanner.nextLine();
        System.out.print("Type 'e' to encode or 'd' to decode: ");
        String choice = scanner.nextLine();

        if (choice.equalsIgnoreCase("e")) {
            System.out.println("Encoded: " + encode(message, shift));
        } else if (choice.equalsIgnoreCase("d")) {
            System.out.println("Decoded: " + decode(message, shift));
        } else {
            System.out.println("Invalid option");
        }
    }
}
