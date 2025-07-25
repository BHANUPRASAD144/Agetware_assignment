import java.util.*;

public class Problem3 {

    static class Element {
        int left;
        int right;
        List<String> values;

        Element(int left, int right, List<String> values) {
            this.left = left;
            this.right = right;
            this.values = values;
        }
    }

    public static List<Element> readElements(Scanner sc, int listNumber) {
        List<Element> list = new ArrayList<>();
        System.out.print("Enter number of elements in list " + listNumber + ": ");
        int count = sc.nextInt();
        for (int i = 0; i < count; i++) {
            System.out.print("Enter left and right positions for element " + (i + 1) + ": ");
            int left = sc.nextInt();
            int right = sc.nextInt();
            System.out.print("Enter number of values for element " + (i + 1) + ": ");
            int valCount = sc.nextInt();
            System.out.print("Enter the values: ");
            List<String> values = new ArrayList<>();
            for (int j = 0; j < valCount; j++) {
                values.add(sc.next());
            }
            list.add(new Element(left, right, values));
        }
        return list;
    }

    public static List<Element> combine(List<Element> list1, List<Element> list2) {
        List<Element> combined = new ArrayList<>();
        List<Element> all = new ArrayList<>();
        all.addAll(list1);
        all.addAll(list2);
        all.sort(Comparator.comparingInt(e -> e.left));
        boolean[] merged = new boolean[all.size()];
        for (int i = 0; i < all.size(); i++) {
            if (merged[i]) continue;
            Element e1 = all.get(i);
            for (int j = i + 1; j < all.size(); j++) {
                if (merged[j]) continue;
                Element e2 = all.get(j);
                int overlap = Math.min(e1.right, e2.right) - Math.max(e1.left, e2.left);
                int len1 = e1.right - e1.left;
                int len2 = e2.right - e2.left;
                if (overlap > 0 && (overlap >= len1 / 2.0 || overlap >= len2 / 2.0)) {
                    e1.values.addAll(e2.values);
                    e1.right = Math.max(e1.right, e2.right);
                    merged[j] = true;
                }
            }
            combined.add(e1);
        }
        return combined;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        List<Element> list1 = readElements(sc, 1);
        List<Element> list2 = readElements(sc, 2);
        List<Element> result = combine(list1, list2);
        System.out.println("Combined output:");
        for (Element e : result) {
            System.out.print("[" + e.left + ", " + e.right + "] -> ");
            System.out.println(e.values);
        }
    }
}
