package com.osteopore.utils;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;

public class ImageUtils {

    public static final int THUMB_WIDTH = 300;
    public static final int THUMB_HEIGHT = 300;
    public static final int THUMB_HEIGHT_LONG = 450;
    public static final int MAX_WIDTH = 1000;
    public static final int MAX_HEIGHT = 1000;

    public static void createThumbnail(String inputFilename, String outFilename, int thumbWidth, int thumbHeight, AspectRatio aspectRatio) throws IOException {
        BufferedImage sourceImage = ImageIO.read(new File(inputFilename));

        double sourceRatio = (double) sourceImage.getWidth() / (double) sourceImage.getHeight();
        double thumbRatio = (double) thumbWidth / (double) thumbHeight;
        int coverWidth = thumbWidth;
        int coverHeight = thumbHeight;
        if (aspectRatio.equals(AspectRatio.COVER)) {
            if (thumbRatio < sourceRatio) {
                sourceRatio = sourceRatio > 10 ? 10 : sourceRatio;
                thumbWidth = (int) (thumbHeight * sourceRatio);
            } else {
                sourceRatio = Double.compare(0.1, sourceRatio) > 0 ? 0.1 : sourceRatio;
                thumbHeight = (int) (thumbWidth / sourceRatio);
            }
        } else if (aspectRatio.equals(AspectRatio.CONTAIN)) {
            if (sourceImage.getWidth() <= thumbWidth && sourceImage.getHeight() <= thumbHeight) {
                ImageIO.write(sourceImage, outFilename.substring(outFilename.lastIndexOf('.') + 1), new File(outFilename));
                return;
            } else if (thumbRatio > sourceRatio) {
                thumbWidth = (int) (thumbHeight * sourceRatio);
            } else {
                thumbHeight = (int) (thumbWidth / sourceRatio);
            }
        }

        Image thumbnail = sourceImage.getScaledInstance(thumbWidth, thumbHeight, Image.SCALE_SMOOTH);
        BufferedImage bufferedThumbnail;
        if (sourceImage.getColorModel().hasAlpha()) {
            bufferedThumbnail = new BufferedImage(thumbnail.getWidth(null), thumbnail.getHeight(null), BufferedImage.TYPE_INT_ARGB);
        } else {
            bufferedThumbnail = new BufferedImage(thumbnail.getWidth(null), thumbnail.getHeight(null), BufferedImage.TYPE_INT_RGB);
        }

        Graphics2D graphics2D = bufferedThumbnail.createGraphics();
        graphics2D.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        graphics2D.setComposite(AlphaComposite.Clear);
        graphics2D.fillRect(0, 0, thumbWidth, thumbHeight);
        graphics2D.setComposite(AlphaComposite.Src);
        graphics2D.drawImage(thumbnail, 0, 0, thumbWidth, thumbHeight, null);
        graphics2D.dispose();

        if (aspectRatio.equals(AspectRatio.COVER)) {
            bufferedThumbnail = bufferedThumbnail.getSubimage(0, 0, coverWidth, coverHeight);
        }
        ImageIO.write(bufferedThumbnail, outFilename.substring(outFilename.lastIndexOf('.') + 1), new File(outFilename));

    }

    public enum AspectRatio {

        COVER, CONTAIN, SCALE;
    }
}
